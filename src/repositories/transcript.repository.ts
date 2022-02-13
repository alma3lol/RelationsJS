import { Connector, Repository, RepositorySearch } from "../types";
import { Media, Transcript } from "../models";
import _ from "lodash";
import moment from "moment";

export class TranscriptRepository extends Repository<Transcript, string> {
  constructor(connector: Connector, private mediaRepository: Repository<Media, string>) {
    super(connector);
  }
  create = async (transcript: Transcript) => {
    let session = this.connector.generateSession();
    await session.run(`
      CREATE (r:Transcript {
        id: $id,
        title: $title,
        content: $content,
        date: $date
      })`, {
        id: transcript.id,
        title: transcript.title,
        content: transcript.content,
        date: transcript.date ? transcript.date.toISOString() : null,
      });
    await session.close();
    for (const attachment of transcript.attachments) {
      const attachmentPath = window.files.upload(transcript.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
      const media = new Media();
      media.setName(attachment.name);
      media.setPath(attachmentPath);
      media.setType('attachment');
      await this.mediaRepository.create(media);
      session = this.connector.generateSession();
      await session.run(`
        MATCH (r:Transcript {id: $id})
        MATCH (m:Media {id: $media})
        CREATE (r)-[:HAS]->(m)`, {
          id: transcript.id,
          media: media.id,
        });
      await session.close();
    }
    for (const mentioned of transcript.mentioned) {
      session = this.connector.generateSession();
      await session.run(`
        MATCH (t:Transcript {id: $id})
        MATCH (p:Person {id: $person})
        CREATE (p)-[:MENTIONED_IN]->(t)`, {
          id: transcript.id,
          person: mentioned.id,
        });
      await session.close();
    }
    return transcript;
  }
  read = async (search: RepositorySearch<Transcript>) => {
    const session = this.connector.generateSession();
    const searchCypher = search ? this._renderSearchObject(search) : '';
    const trx = session.beginTransaction();
    const transcrips = await trx.run(
      `MATCH (n:Transcript)
      ${searchCypher ? `WHERE ${searchCypher}` : ''}
      RETURN n`
    ).then(async result => await Promise.all(result.records.map(async record => {
        const transcriptObj = record.toObject().n.properties;
        const transcriptModel = new Transcript(transcriptObj.id);
        transcriptModel.setTitle(transcriptObj.title);
        transcriptModel.setContent(transcriptObj.content);
        transcriptModel.setDate(moment(transcriptObj.date).toDate());
        const attachments = await trx.run(`
          MATCH (t:Transcript {id: $id}), (t)-[:HAS]->(m:Media)
          RETURN m`, {
            id: transcriptObj.id,
          }).then(async result => await Promise.all(result.records.map(async record => {
            const mediaObj = record.toObject().m.properties;
            return window.files.getFile(mediaObj.path);
          })));
        transcriptModel.setAttachments(attachments);
        const mentioned = await trx.run(`MATCH (p:Person)-[:MENTIONED_IN]->(t:Transcript { id: $id }) RETURN p`, { id: transcriptModel.id }).then(result => result.records.map(record => ({ id: record.get('p').properties.id, label: record.get('p').properties.arabicName })));
        transcriptModel.setMentioned(mentioned);
        return transcriptModel;
      })));
    await session.close();
    return transcrips;
  }
  readById = async (id: string) => {
    const session = this.connector.generateSession();
    const trx = session.beginTransaction();
    const transcript = await trx.run(`
        MATCH (r:Transcript)
        WHERE r.id = $id
        RETURN r
      `, { id }).then(async result => {
        if (result.records.length === 0) throw new Error("No such transcript");
        const transcriptObj = result.records[0].toObject().r.properties;
        const transcripModel = new Transcript(transcriptObj.id);
        transcripModel.setTitle(transcriptObj.title);
        transcripModel.setContent(transcriptObj.content);
        transcripModel.setDate(moment(transcriptObj.date).toDate());
        const attachments = await trx.run(`
          MATCH (t:Transcript {id: $id}), (t)-[:HAS]->(m:Media)
          RETURN m`, {
            id: transcriptObj.id,
          }).then(async result => await Promise.all(result.records.map(async record => {
            const mediaObj = record.toObject().m.properties;
            return window.files.getFile(mediaObj.path);
          })));
        transcripModel.setAttachments(attachments);
        const mentioned = await trx.run(`MATCH (p:Person)-[:MENTIONED_IN]->(t:Transcript { id: $id }) RETURN p`, { id: transcripModel.id }).then(result => result.records.map(record => ({ id: record.get('p').properties.id, label: record.get('p').properties.arabicName })));
        transcripModel.setMentioned(mentioned);
        return transcripModel;
      });
    await session.close();
    return transcript;
  }
  update = async (id: string, transcript: Transcript) => {
    const oldTranscript = await this.readById(id);
    let session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Transcript)
      WHERE r.id = $id
      SET
        r.title = $title,
        r.content = $content,
        r.date = $date
      `, {
        id,
        title: transcript.title,
        content: transcript.content,
        date: transcript.date ? transcript.date.toISOString() : null,
      });
    await session.run(`
      MATCH (t:Transcript {id: $id})
      OPTIONAL MATCH ()-[r:MENTIONED_IN]->(t)
      DETACH DELETE r`, {
        id: transcript.id,
    });
    await session.close();
    for(const mentioned of transcript.mentioned) {
      session = this.connector.generateSession();
      await session.run(`
        MATCH (t:Transcript {id: $id})
        MATCH (p:Person {id: $person})
        CREATE (p)-[:MENTIONED_IN]->(t)`, {
          id: transcript.id,
          person: mentioned.id,
        });
      await session.close();
    }
    for(const attachment of oldTranscript.attachments) {
        if (_.find(transcript.attachments, { name: attachment.name })) continue;
        session = this.connector.generateSession();
        await session.run(`
            MATCH (m:Media { type: 'attachment' })
            WHERE m.path ENDS WITH $name
            DETACH DELETE m
        `, { name: attachment.name });
        await session.close();
        window.files.delete(transcript.id, 'attachment', attachment.name);
    }
    for (const attachment of transcript.attachments) {
        if (_.find(oldTranscript.attachments, { name: attachment.name })) continue;
        const attachmentPath = window.files.upload(transcript.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
        const media = new Media();
        media.setName(attachment.name);
        media.setPath(attachmentPath);
        media.setType('attachment');
        await this.mediaRepository.create(media);
        session = this.connector.generateSession();
        await session.run(`
            MATCH (t:Transcript {id: $id})
            MATCH (m:Media {id: $media})
            CREATE (t)-[:HAS]->(m)
        `, {
            id: transcript.id,
            media: media.id,
        });
        await session.close();
    }
    return transcript;
  }
  delete = async (id: string) => {
    const oldTranscript = await this.readById(id);
    let session = this.connector.generateSession();
    await session.run(`
      MATCH (t:Transcript { id: $id })
      OPTIONAL MATCH (t)-[r:HAS]->()
      DETATCH DELETE r, t
      `, { id });
    await session.close();
    for(const attachment of oldTranscript.attachments) {
        session = this.connector.generateSession();
        await session.run(`
            MATCH (m:Media { type: 'attachment' })
            WHERE m.path ENDS WITH $name
            DETACH DELETE m
        `, { name: attachment.name });
        await session.close();
        window.files.delete(id, 'attachment', attachment.name);
    }
  }
}
