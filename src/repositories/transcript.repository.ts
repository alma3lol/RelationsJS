import { Connector, Repository } from "../types";
import { Media, Transcript } from "../models";

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
        text: $text,
        date: $date
      })`, {
        id: transcript.id,
        title: transcript.title,
        text: transcript.content,
        date: transcript.date,
      });
    await session.close();
    transcript.attachments.forEach(async (attachment) => {
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
    });
    return transcript;
  }
  read = async () => {
    const session = this.connector.generateSession();
    const transcrips = await session.run(
      `MATCH (r:Transcript)
      RETURN r`
    ).then(result => result.records.map(record => {
        const transcripObj = record.toObject().r.properties;
        const transcripModel = new Transcript(transcripObj.id);
        transcripModel.setTitle(transcripObj.title);
        transcripModel.setContent(transcripObj.text);
        transcripModel.setDate(transcripObj.date);
        return transcripModel;
      }));
    await session.close();
    return transcrips;
  }
  readById = async (id: string) => {
    const session = this.connector.generateSession();
    const transcript = await session.run(`
        MATCH (r:Transcript)
        WHERE r.id = $id
        RETURN r
      `, { id }).then(result => {
        if (result.records.length === 0) throw new Error("No such transcript");
        const recordObj = result.records[0].toObject().r.properties;
        const recordModel = new Transcript(recordObj.id);
        recordModel.setTitle(recordObj.title);
        recordModel.setContent(recordObj.text);
        recordModel.setDate(recordObj.date);
        return recordModel;
      });
    await session.close();
    return transcript;
  }
  update = async (id: string, transcript: Transcript) => {
    const session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Transcript)
      WHERE r.id = $id
      SET
        r.title = $title,
        r.text = $text,
        r.date = $date
      `, {
        id,
        title: transcript.title,
        text: transcript.content,
        date: transcript.date,
      });
    await session.close();
    return transcript;
  }
  delete = async (id: string) => {
    const session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Transcript)
      WHERE r.id = $id
      DETATCH DELETE r
      `, { id });
    await session.close();
  }
}
