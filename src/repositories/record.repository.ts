import { Connector, Repository } from "../types";
import { Media, Record } from "../models";

export class RecordRepository extends Repository<Record, string> {
  constructor(connector: Connector, private mediaRepository: Repository<Media, string>) {
    super(connector);
  }
  create = async (record: Record) => {
    let session = this.connector.generateSession();
    await session.run(`
      CREATE (r:Record {
        id: $id,
        title: $title,
        text: $text,
        date: $date
      })`, {
        id: record.id,
        title: record.title,
        text: record.content,
        date: record.date,
      });
    await session.close();
    record.attachments.forEach(async (attachment) => {
      const attachmentPath = window.files.upload(record.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
      const media = new Media();
      media.setName(attachment.name);
      media.setPath(attachmentPath);
      media.setType('attachment');
      await this.mediaRepository.create(media);
      session = this.connector.generateSession();
      await session.run(`
        MATCH (r:Record {id: $id})
        MATCH (m:Media {id: $media})
        CREATE (r)-[:HAS]->(m)`, {
          id: record.id,
          media: media.id,
        });
      await session.close();
    });
    return record;
  }
  read = async () => {
    const session = this.connector.generateSession();
    const records = await session.run(
      `MATCH (r:Record)
      RETURN r`
    ).then(result => result.records.map(record => {
        const recordObj = record.toObject().r.properties;
        const recordModel = new Record(recordObj.id);
        recordModel.setTitle(recordObj.title);
        recordModel.setContent(recordObj.text);
        recordModel.setDate(recordObj.date);
        return recordModel;
      }));
    await session.close();
    return records;
  }
  readById = async (id: string) => {
    const session = this.connector.generateSession();
    const record = await session.run(`
        MATCH (r:Record)
        WHERE r.id = $id
        RETURN r
      `, { id }).then(result => {
        if (result.records.length === 0) throw new Error("No such record");
        const recordObj = result.records[0].toObject().r.properties;
        const recordModel = new Record(recordObj.id);
        recordModel.setTitle(recordObj.title);
        recordModel.setContent(recordObj.text);
        recordModel.setDate(recordObj.date);
        return recordModel;
      });
    await session.close();
    return record;
  }
  update = async (id: string, record: Record) => {
    const session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Record)
      WHERE r.id = $id
      SET
        r.title = $title,
        r.text = $text,
        r.date = $date
      `, {
        id,
        title: record.title,
        text: record.content,
        date: record.date,
      });
    await session.close();
    return record;
  }
  delete = async (id: string) => {
    const session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Record)
      WHERE r.id = $id
      DETATCH DELETE r
      `, { id });
    await session.close();
  }
}
