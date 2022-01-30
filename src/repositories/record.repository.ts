import { Repository } from "../types";
import { Record } from "../models";

export class RecordRepository extends Repository<Record, string> {
  create = async (record: Record) => {
    const session = this.connector.generateSession();
    await session.run(
      `CREATE (r:Record {
        id: $id,
        title: $title,
        text: $text,
        date: $date
      })`,
      {
        id: record.id,
        title: record.title,
        text: record.text,
        date: record.date,
      }
    );
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
        recordModel.setText(recordObj.text);
        recordModel.setDate(recordObj.date);
        return recordModel;
      }));
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
        recordModel.setText(recordObj.text);
        recordModel.setDate(recordObj.date);
        return recordModel;
      });
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
        text: record.text,
        date: record.date,
      });
    return record;
  }
  delete = async (id: string) => {
    const session = this.connector.generateSession();
    await session.run(`
      MATCH (r:Record)
      WHERE r.id = $id
      DETATCH DELETE r
      `, {
        id,
      });
  }
}
