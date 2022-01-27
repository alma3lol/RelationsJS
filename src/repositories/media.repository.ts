import { Media } from "../models";
import { Repository } from "../types";

export class MediaRepository extends Repository<Media, string> {
    create = async (media: Media) => {
        const session = this.generateSession();
        await session.run(`CREATE (m:Media { id: $id, name: $name, path: $path, type: $type })`, { id: media.id, name: media.name, path: media.path, type: media.type });
        await session.close();
        return media;
    }
    read = async () => {
        const session = this.generateSession();
        const medias = await session.run(`MATCH (m:Media) RETURN m`).then(result => result.records.map(record => {
            const mediaObj = record.toObject().m.properties;
            const media = new Media(mediaObj.id);
            media.setName(mediaObj.name);
            media.setPath(mediaObj.path);
            media.setType(mediaObj.type);
            return media;
        }))
        await session.close();
        return medias;
    }
    readById = async (id: string) => {
        const session = this.generateSession();
        const media = await session.run(`MATCH (m:Media) WHERE m.id = $id RETURN m`, { id }).then(result => {
            if (result.records.length === 0) throw Error('No such a media');
            const mediaObj = result.records[0].toObject().m.properties;
            const media = new Media(mediaObj.id);
            media.setName(mediaObj.name);
            media.setPath(mediaObj.path);
            media.setType(mediaObj.type);
            return media;
        });
        await session.close();
        return media;
    }
    update = async (id: string, media: Media) => {
        const session = this.generateSession();
        await session.run(`MATCH (m:Media) WHERE m.id = $id SET m.name = $name, m.path = $path, m.type = $type`, { id, name: media.name, path: media.path, type: media.type });
        await session.close();
        return media;
    }
    delete = async (id: string) => {
        const session = this.generateSession();
        await session.run(`MATCH (m:Media) WHERE m.id = $id DETACH DELETE m`, { id });
        await session.close();
    }
}
