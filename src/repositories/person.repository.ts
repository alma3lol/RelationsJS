import _ from "lodash";
import moment from "moment";
import { Category, Media, Nationality, Person } from "../models";
import { Connector, Repository, RepositorySearch } from "../types";

const UUIDv4RegexExp = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

export class PersonRepository extends Repository<Person, string> {
    constructor(
        connector: Connector,
        private readonly categoryRepository: Repository<Category, string>,
        private readonly mediaRepository: Repository<Media, string>,
        private readonly nationalityRepository: Repository<Nationality, string>,
    ) { super(connector); }
    create = async (person: Person) => {
        let session = this.connector.generateSession();
        await session.run(`
            CREATE (p:Person {
                id: $id,
                fileNumber: $fileNumber,
                arabicName: $arabicName,
                englishName: $englishName,
                motherName: $motherName,
                nickname: $nickname,
                birthDate: $birthDate,
                birthPlace: $birthPlace,
                job: $job,
                phone: $phone,
                email: $email,
                workplace: $workplace,
                address: $address,
                gpsLocation: $gpsLocation,
                passportNumber: $passportNumber,
                passportIssueDate: $passportIssueDate,
                passportIssuePlace: $passportIssuePlace,
                idNumber: $idNumber,
                nationalNumber: $nationalNumber,
                registerationNumber: $registerationNumber,
                restrictions: $restrictions,
                notes: $notes,
                extra: $extra
            })
        `, {
            id: person.id,
            fileNumber: person.fileNumber,
            arabicName: person.arabicName,
            englishName: person.englishName,
            motherName: person.motherName,
            nickname: person.nickname,
            birthDate: person.birthDate ? person.birthDate.toISOString() : null,
            birthPlace: person.birthPlace,
            job: person.job,
            phone: person.phone,
            email: person.email,
            workplace: person.workplace,
            address: person.address,
            gpsLocation: person.gpsLocation,
            passportNumber: person.passportNumber,
            passportIssueDate: person.passportIssueDate ? person.passportIssueDate.toISOString() : null,
            passportIssuePlace: person.passportIssuePlace,
            idNumber: person.idNumber,
            nationalNumber: person.nationalNumber,
            registerationNumber: person.registerationNumber,
            restrictions: person.restrictions.map(v => v),
            notes: person.notes,
            extra: person.extra.map(v => v),
        });
        await session.close();
        let category = new Category(person.category.id);
        if (!person.category.id.match(UUIDv4RegexExp)) {
            category = new Category();
            category.setName(person.category.id);
            await this.categoryRepository.create(category);
        }
        session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (c:Category {id: $category})
            CREATE (p)-[:CATEGORIZED_AS]->(c)
        `, {
            id: person.id,
            category: category.id,
        });
        await session.close();
        let nationality = new Nationality(person.nationality.id)
        if (!person.nationality.id.match(UUIDv4RegexExp)) {
            nationality = new Nationality();
            nationality.setName(person.nationality.id);
            await this.nationalityRepository.create(nationality);
        }
        session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (n:Nationality {id: $nationality})
            CREATE (p)-[:FROM]->(n)
        `, {
            id: person.id,
            nationality: nationality.id,
        });
        if (person.image) {
            const imagePath = window.files.upload(person.id, 'avatar', person.image.name, (await person.image.arrayBuffer()));
            const media = new Media();
            media.setName(person.image.name);
            media.setPath(imagePath);
            media.setType('avatar');
            await this.mediaRepository.create(media);
            session = this.connector.generateSession();
            await session.run(`
                MATCH (p:Person {id: $id})
                MATCH (m:Media {id: $media})
                CREATE (p)-[:HAS]->(m)
            `, {
                id: person.id,
                media: media.id,
            });
            await session.close();
        }
        if (person.idImage) {
            const idImagePath = window.files.upload(person.id, 'id', person.idImage.name, (await person.idImage.arrayBuffer()));
            const media = new Media();
            media.setName(person.idImage.name);
            media.setPath(idImagePath);
            media.setType('id');
            await this.mediaRepository.create(media);
            session = this.connector.generateSession();
            await session.run(`
                MATCH (p:Person {id: $id})
                MATCH (m:Media {id: $media})
                CREATE (p)-[:HAS]->(m)
            `, {
                id: person.id,
                media: media.id,
            });
            await session.close();
        }
        if (person.passportImage) {
            const passportImagePath = window.files.upload(person.id, 'passport', person.passportImage.name, (await person.passportImage.arrayBuffer()));
            const media = new Media();
            media.setName(person.passportImage.name);
            media.setPath(passportImagePath);
            media.setType('passport');
            await this.mediaRepository.create(media);
            session = this.connector.generateSession();
            await session.run(`
                MATCH (p:Person {id: $id})
                MATCH (m:Media {id: $media})
                CREATE (p)-[:HAS]->(m)
            `, {
                id: person.id,
                media: media.id,
            });
            await session.close();
        }
        if (person.attachments.length > 0) {
            for (const attachment of person.attachments) {
                const attachmentPath = window.files.upload(person.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
                const media = new Media();
                media.setName(attachment.name);
                media.setPath(attachmentPath);
                media.setType('attachment');
                await this.mediaRepository.create(media);
                session = this.connector.generateSession();
                await session.run(`
                    MATCH (p:Person {id: $id})
                    MATCH (m:Media {id: $media})
                    CREATE (p)-[:HAS]->(m)
                `, {
                    id: person.id,
                    media: media.id,
                });
                await session.close();
            }
        }
        return person;
    }
    read = async (search: RepositorySearch<Person>) => {
        const session = this.connector.generateSession();
        const searchCypher = search ? this._renderSearchObject(search) : '';
        const trx = session.beginTransaction();
        const persons = await trx.run(`MATCH (n:Person)${searchCypher ? ` WHERE ${searchCypher}` : ''} RETURN n`).then(async result => await Promise.all(result.records.map(async record => {
            const personObj = record.toObject().n.properties;
            const person = new Person(personObj.id);
            person.setFileNumber(personObj.fileNumber);
            person.setArabicName(personObj.arabicName);
            person.setEnglishName(personObj.englishName);
            person.setMotherName(personObj.motherName);
            person.setNickname(personObj.nickname);
            if (personObj.birthDate) person.setBirthDate(moment(personObj.birthDate).toDate());
            person.setBirthPlace(personObj.birthPlace);
            person.setJob(personObj.job);
            person.setPhone(personObj.phone);
            person.setEmail(personObj.email);
            person.setWorkplace(personObj.workplace);
            person.setAddress(personObj.address);
            person.setGpsLocation(personObj.gpsLocation);
            person.setPassportNumber(personObj.passportNumber);
            if (personObj.passportIssueDate) person.setPassportIssueDate(moment(personObj.passportIssueDate).toDate());
            person.setPassportIssuePlace(personObj.passportIssuePlace);
            person.setIdNumber(personObj.idNumber);
            person.setNationalNumber(personObj.nationalNumber);
            person.setRegisterationNumber(personObj.registerationNumber);
            person.setRestrictions(personObj.restrictions);
            person.setNotes(personObj.notes);
            person.setExtra(personObj.extra);
            const media = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:HAS]->(m:Media)
                RETURN m
            `, {
                id: person.id,
            }).then(result => result.records.map(record => {
                const mediaObj = record.toObject().m.properties;
                const media = new Media(mediaObj.id);
                media.setName(mediaObj.name);
                media.setPath(mediaObj.path);
                media.setType(mediaObj.type);
                return media;
            }));
            media.forEach(m => {
                switch (m.type) {
                    case 'avatar':
                        person.setImage(window.files.getFile(m.path));
                        break;
                    case 'id':
                        person.setIdImage(window.files.getFile(m.path));
                        break;
                    case 'passport':
                        person.setPassportImage(window.files.getFile(m.path));
                        break;
                    case 'attachment':
                        person.setAttachments(_.concat(person.attachments, [window.files.getFile(m.path)]));
                        break;
                }
            });
            const category = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:CATEGORIZED_AS]->(c:Category)
                RETURN c
            `, {
                id: person.id,
            }).then(result => {
                if (result.records.length === 0) return null;
                const categoryObj = result.records[0].toObject().c.properties;
                return { id: categoryObj.id, label: categoryObj.name };
            });
            if (category) person.setCategory(category);
            const nationality = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:FROM]->(n:Nationality)
                RETURN n
            `, {
                id: person.id,
            }).then(result => {
                if (result.records.length === 0) return null;
                const nationalityObj = result.records[0].toObject().n.properties;
                return { id: nationalityObj.id, label: nationalityObj.name };
            });
            if (nationality) person.setNationality(nationality);
            return person;
        })));
        await session.close();
        return persons;
    }
    readById = async (id: string) => {
        const session = this.connector.generateSession();
        const trx = session.beginTransaction();
        const person = await trx.run(`MATCH (p:Person) WHERE p.id = $id RETURN p`, { id }).then(async result => {
            if (result.records.length === 0) throw Error('No such a person');
            const personObj = result.records[0].toObject().p.properties;
            const person = new Person(personObj.id);
            person.setFileNumber(personObj.fileNumber);
            person.setArabicName(personObj.arabicName);
            person.setEnglishName(personObj.englishName);
            person.setMotherName(personObj.motherName);
            person.setNickname(personObj.nickname);
            if (personObj.birthDate) person.setBirthDate(moment(personObj.birthDate).toDate());
            person.setBirthPlace(personObj.birthPlace);
            person.setJob(personObj.job);
            person.setPhone(personObj.phone);
            person.setEmail(personObj.email);
            person.setWorkplace(personObj.workplace);
            person.setAddress(personObj.address);
            person.setGpsLocation(personObj.gpsLocation);
            person.setPassportNumber(personObj.passportNumber);
            if (personObj.passportIssueDate) person.setPassportIssueDate(moment(personObj.passportIssueDate).toDate());
            person.setPassportIssuePlace(personObj.passportIssuePlace);
            person.setIdNumber(personObj.idNumber);
            person.setNationalNumber(personObj.nationalNumber);
            person.setRegisterationNumber(personObj.registerationNumber);
            person.setRestrictions(personObj.restrictions);
            person.setNotes(personObj.notes);
            person.setExtra(personObj.extra);
            const media = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:HAS]->(m:Media)
                RETURN m
            `, {
                id: person.id,
            }).then(result => result.records.map(record => {
                const mediaObj = record.toObject().m.properties;
                const media = new Media(mediaObj.id);
                media.setName(mediaObj.name);
                media.setPath(mediaObj.path);
                media.setType(mediaObj.type);
                return media;
            }));
            media.forEach(m => {
                switch (m.type) {
                    case 'avatar':
                        person.setImage(window.files.getFile(m.path));
                        break;
                    case 'id':
                        person.setIdImage(window.files.getFile(m.path));
                        break;
                    case 'passport':
                        person.setPassportImage(window.files.getFile(m.path));
                        break;
                    case 'attachment':
                        person.setAttachments(_.concat(person.attachments, [window.files.getFile(m.path)]));
                        break;
                }
            });
            const category = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:CATEGORIZED_AS]->(c:Category)
                RETURN c
            `, {
                id: person.id,
            }).then(result => {
                if (result.records.length === 0) return null;
                const categoryObj = result.records[0].toObject().c.properties;
                return { id: categoryObj.id, label: categoryObj.name };
            });
            if (category) person.setCategory(category);
            const nationality = await trx.run(`
                MATCH (p:Person {id: $id})
                MATCH (p)-[:FROM]->(n:Nationality)
                RETURN n
            `, {
                id: person.id,
            }).then(result => {
                if (result.records.length === 0) return null;
                const nationalityObj = result.records[0].toObject().n.properties;
                return { id: nationalityObj.id, label: nationalityObj.name };
            });
            if (nationality) person.setNationality(nationality);
            return person;
        });
        await session.close();
        return person;
    }
    update = async (id: string, person: Person) => {
        const oldPerson = await this.readById(id);
        let session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person) WHERE p.id = $id
                SET
                    p.fileNumber = $fileNumber,
                    p.arabicName = $arabicName,
                    p.englishName = $englishName,
                    p.motherName = $motherName,
                    p.nickname = $nickname,
                    p.birthDate = $birthDate,
                    p.birthPlace = $birthPlace,
                    p.job = $job,
                    p.phone = $phone,
                    p.email = $email,
                    p.workplace = $workplace,
                    p.address = $address,
                    p.gpsLocation = $gpsLocation,
                    p.passportNumber = $passportNumber,
                    p.passportIssueDate = $passportIssueDate,
                    p.passportIssuePlace = $passportIssuePlace,
                    p.idNumber = $idNumber,
                    p.nationalNumber = $nationalNumber,
                    p.registerationNumber = $registerationNumber,
                    p.restrictions = $restrictions,
                    p.notes = $notes,
                    p.extra = $extra
        `, {
            id,
            fileNumber: person.fileNumber,
            arabicName: person.arabicName,
            englishName: person.englishName,
            motherName: person.motherName,
            nickname: person.nickname,
            birthDate: person.birthDate ? person.birthDate.toISOString() : null,
            birthPlace: person.birthPlace,
            job: person.job,
            phone: person.phone,
            email: person.email,
            workplace: person.workplace,
            address: person.address,
            gpsLocation: person.gpsLocation,
            passportNumber: person.passportNumber,
            passportIssueDate: person.passportIssueDate ? person.passportIssueDate.toISOString() : null,
            passportIssuePlace: person.passportIssuePlace,
            idNumber: person.idNumber,
            nationalNumber: person.nationalNumber,
            registerationNumber: person.registerationNumber,
            restrictions: person.restrictions.map(v => v),
            notes: person.notes,
            extra: person.extra.map(v => v),
        });
        await session.close();
        let category = new Category(person.category.id);
        if (!person.category.id.match(UUIDv4RegexExp)) {
            category = new Category();
            category.setName(person.category.id);
            await this.categoryRepository.create(category);
        }
        session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (c:Category {id: $category})
            MATCH (p)-[r:CATEGORIZED_AS]->()
            DELETE r
            CREATE (p)-[:CATEGORIZED_AS]->(c)
        `, {
            id: person.id,
            category: category.id,
        });
        await session.close();
        let nationality = new Nationality(person.nationality.id)
        if (!person.nationality.id.match(UUIDv4RegexExp)) {
            nationality = new Nationality();
            nationality.setName(person.nationality.id);
            await this.nationalityRepository.create(nationality);
        }
        session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (n:Nationality {id: $nationality})
            MATCH (p)-[r:FROM]->()
            DELETE r
            CREATE (p)-[:FROM]->(n)
        `, {
            id: person.id,
            nationality: nationality.id,
        });
        await session.close();
        if (person.image) {
            let shouldUpdate = true;
            if (oldPerson.image) {
                if (oldPerson.image.name !== person.image.name) {
                    session = this.connector.generateSession();
                    await session.run(`
                        MATCH (m:Media { type: 'avatar' })
                        WHERE m.path ENDS WITH $name
                        DETACH DELETE m
                    `, { name: oldPerson.image.name }).then(console.log);
                    await session.close();
                    window.files.delete(person.id, 'avatar', oldPerson.image.name);
                } else shouldUpdate = false;
            }
            if (shouldUpdate) {
                const imagePath = window.files.upload(person.id, 'avatar', person.image.name, (await person.image.arrayBuffer()));
                const media = new Media();
                media.setName(person.image.name);
                media.setPath(imagePath);
                media.setType('avatar');
                await this.mediaRepository.create(media);
                session = this.connector.generateSession();
                await session.run(`
                    MATCH (p:Person {id: $id})
                    MATCH (m:Media {id: $media})
                    CREATE (p)-[:HAS]->(m)
                `, {
                    id: person.id,
                    media: media.id,
                });
                await session.close();
            }
        }
        if (person.idImage) {
            let shouldUpdate = true;
            if (oldPerson.idImage) {
                if (oldPerson.idImage.name !== person.idImage.name) {
                    session = this.connector.generateSession();
                    await session.run(`
                        MATCH (m:Media { type: 'id' })
                        WHERE m.path ENDS WITH $name
                        DETACH DELETE m
                    `, { name: oldPerson.idImage.name });
                    await session.close();
                    window.files.delete(person.id, 'id', oldPerson.idImage.name);
                } else shouldUpdate = false;
            }
            if (shouldUpdate) {
                const imagePath = window.files.upload(person.id, 'id', person.idImage.name, (await person.idImage.arrayBuffer()));
                const media = new Media();
                media.setName(person.idImage.name);
                media.setPath(imagePath);
                media.setType('id');
                await this.mediaRepository.create(media);
                session = this.connector.generateSession();
                await session.run(`
                    MATCH (p:Person {id: $id})
                    MATCH (m:Media {id: $media})
                    CREATE (p)-[:HAS]->(m)
                `, {
                    id: person.id,
                    media: media.id,
                });
                await session.close();
            }
        }
        if (person.passportImage) {
            let shouldUpdate = true;
            if (oldPerson.passportImage) {
                if (oldPerson.passportImage.name !== person.passportImage.name) {
                    session = this.connector.generateSession();
                    await session.run(`
                        MATCH (m:Media { type: 'passport' })
                        WHERE m.path ENDS WITH $name
                        DETACH DELETE m
                    `, { name: oldPerson.passportImage.name });
                    await session.close();
                    window.files.delete(person.id, 'passport', oldPerson.passportImage.name);
                } else shouldUpdate = false;
            }
            if (shouldUpdate) {
                const imagePath = window.files.upload(person.id, 'passport', person.passportImage.name, (await person.passportImage.arrayBuffer()));
                const media = new Media();
                media.setName(person.passportImage.name);
                media.setPath(imagePath);
                media.setType('passport');
                await this.mediaRepository.create(media);
                session = this.connector.generateSession();
                await session.run(`
                    MATCH (p:Person {id: $id})
                    MATCH (m:Media {id: $media})
                    CREATE (p)-[:HAS]->(m)
                `, {
                    id: person.id,
                    media: media.id,
                });
                await session.close();
            }
        }
        for(const attachment of oldPerson.attachments) {
            if (_.find(person.attachments, { name: attachment.name })) continue;
            session = this.connector.generateSession();
            await session.run(`
                MATCH (m:Media { type: 'attachment' })
                WHERE m.path ENDS WITH $name
                DETACH DELETE m
            `, { name: attachment.name });
            await session.close();
            window.files.delete(person.id, 'attachment', attachment.name);
        }
        if (person.attachments.length > 0) {
            for (const attachment of person.attachments) {
                if (_.find(oldPerson.attachments, { name: attachment.name })) continue;
                const attachmentPath = window.files.upload(person.id, 'attachment', attachment.name, (await attachment.arrayBuffer()));
                const media = new Media();
                media.setName(attachment.name);
                media.setPath(attachmentPath);
                media.setType('attachment');
                await this.mediaRepository.create(media);
                session = this.connector.generateSession();
                await session.run(`
                    MATCH (p:Person {id: $id})
                    MATCH (m:Media {id: $media})
                    CREATE (p)-[:HAS]->(m)
                `, {
                    id: person.id,
                    media: media.id,
                });
                await session.close();
            }
        }
        return person;
    }
    delete = async (id: string) => {
        const oldPerson = await this.readById(id);
        let session = this.connector.generateSession();
        await session.run(`
            MATCH (p:Person { id: $id })
            OPTIONAL MATCH (p)-[r]->(o)
            WHERE NOT (r:CATEGORIZED_AS)
            DETACH DELETE r, o, p
        `, {
            id
        });
        await session.close();
        for(const attachment of oldPerson.attachments) {
            session = this.connector.generateSession();
            await session.run(`
                MATCH (m:Media { type: 'attachment' })
                WHERE m.path ENDS WITH $name
                DETACH DELETE m
            `, { name: attachment.name });
            await session.close();
            window.files.delete(oldPerson.id, 'attachment', attachment.name);
        }
        if (oldPerson.image) {
            session = this.connector.generateSession();
            await session.run(`
                MATCH (m:Media { type: 'avatar' })
                WHERE m.path ENDS WITH $name
                DETACH DELETE m
            `, { name: oldPerson.image.name });
            await session.close();
            window.files.delete(oldPerson.id, 'avatar', oldPerson.image.name);
        }
        if (oldPerson.idImage) {
            session = this.connector.generateSession();
            await session.run(`
                MATCH (m:Media { type: 'id' })
                WHERE m.path ENDS WITH $name
                DETACH DELETE m
            `, { name: oldPerson.idImage.name });
            await session.close();
            window.files.delete(oldPerson.id, 'id', oldPerson.idImage.name);
        }
        if (oldPerson.passportImage) {
            session = this.connector.generateSession();
            await session.run(`
                MATCH (m:Media { type: 'passport' })
                WHERE m.path ENDS WITH $name
                DETACH DELETE m
            `, { name: oldPerson.passportImage.name });
            await session.close();
            window.files.delete(oldPerson.id, 'passport', oldPerson.passportImage.name);
        }
    }
}
