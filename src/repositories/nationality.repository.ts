import { Nationality } from "../models";
import { Repository } from "../types";

export class NationalityRepository extends Repository<Nationality, string> {
    create = async (nationality: Nationality) => {
        const session = this.connector.generateSession();
        await session.run(`
            CREATE (n:Nationality {
                id: $id,
                name: $name
            })
        `, { id: nationality.id, name: nationality.name });
        await session.close();
        return nationality;
    }
    read = async () => {
        const session = this.connector.generateSession();
        const nationalities = await session.run(`MATCH (n:Nationality) RETURN n`).then(result => result.records.map(record => {
            const nationalityObj = record.toObject().n.properties;
            const nationality = new Nationality(nationalityObj.id);
            nationality.setName(nationalityObj.name)
            return nationality;
        }));
        await session.close();
        return nationalities;
    }
    readById = async (id: string) => {
        const session = this.connector.generateSession();
        const nationality = await session.run(`MATCH (n:Nationality) WHERE n.id = $id RETURN n`, { id }).then(result => {
            if (result.records.length === 0) throw Error('No such a nationality');
            const nationalityObj = result.records[0].toObject().n.properties;
            const nationality = new Nationality(nationalityObj.id);
            nationality.setName(nationalityObj.name)
            return nationality;
        });
        await session.close();
        return nationality;
    }
    update = async (id: string, nationality: Nationality) => {
        const session = this.connector.generateSession();
        await session.run(`
            MATCH (n:Nationality)
            WHERE n.id = $id
            SET n.name = $name
        `, { id, name: nationality.name });
        await session.close();
        return nationality;
    }
    delete = async (id: string) => {
        const session = this.connector.generateSession();
        await session.run(`MATCH (n:Nationality) WHERE n.id = $id DETACH DELETE n`, { id });
        await session.close();
    }
}
