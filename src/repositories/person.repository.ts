import { Driver } from "neo4j-driver";
import { Category, Media, Nationality, Person } from "../models";
import { SessionOptions } from "../neo4j-sigma-graph";
import { Repository } from "../types";

export class PersonRepository extends Repository<Person, string> {
    constructor(
        driver: Driver,
        sessionOptions: SessionOptions,
        private readonly categoryRepository: Repository<Category, string>,
        private readonly mediaRepository: Repository<Media, string>,
        private readonly nationalityRepository: Repository<Nationality, string>,
    ) { super(driver, sessionOptions); }
    create = async (person: Person) => {
        let session = this.generateSession();
        const UUIDv4RegexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
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
            birthDate: person.birthDate.toISOString(),
            birthPlace: person.birthPlace,
            job: person.job,
            phone: person.phone,
            email: person.email,
            workplace: person.workplace,
            address: person.address,
            gpsLocation: person.gpsLocation,
            passportNumber: person.passportNumber,
            passportIssueDate: person.passportIssueDate.toISOString(),
            passportIssuePlace: person.passportIssuePlace,
            idNumber: person.idNumber,
            nationalNumber: person.nationalNumber,
            registerationNumber: person.registerationNumber,
            restrictions: person.restrictions.map(v => v),
            notes: person.notes,
            extra: person.extra.map(v => v),
        });
        await session.close();
        let category = new Category(person.category);
        if (!UUIDv4RegexExp.test(person.category)) {
            category = new Category();
            category.setName(person.category);
            await this.categoryRepository.create(category);
        }
        session = this.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (c:Category {id: $category})
            CREATE (p)-[:CATEGORIZED_AS]->(c)
        `, {
            id: person.id,
            category: category.id,
        });
        await session.close();
        let nationality = new Nationality(person.nationality)
        if (!UUIDv4RegexExp.test(person.nationality)) {
            nationality = new Nationality();
            nationality.setName(person.nationality);
            await this.nationalityRepository.create(nationality);
        }
        session = this.generateSession();
        await session.run(`
            MATCH (p:Person {id: $id})
            MATCH (c:Nationality {id: $nationality})
            CREATE (p)-[:FROM]->(c)
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
            session = this.generateSession();
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
            session = this.generateSession();
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
            session = this.generateSession();
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
                session = this.generateSession();
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
    read = async () => {
        const session = this.generateSession();
        const persons = await session.run(`MATCH (p:Person) RETURN p`).then(result => result.records.map(record => {
            const personObj = record.toObject().p.properties;
            const person = new Person(personObj.id);
            person.setFileNumber(personObj.fileNumber);
            person.setArabicName(personObj.arabicName);
            person.setEnglishName(personObj.englishNamen);
            person.setMotherName(personObj.motherName);
            person.setNickname(personObj.nickname);
            person.setBirthDate(new Date(personObj.birthDate));
            person.setBirthPlace(personObj.birthPlace);
            person.setJob(personObj.job);
            person.setNationality(personObj.nationality);
            person.setPhone(personObj.phone);
            person.setEmail(personObj.email);
            person.setWorkplace(personObj.workplace);
            person.setAddress(personObj.address);
            person.setGpsLocation(personObj.gpsLocation);
            person.setPassportNumber(personObj.passportNumber);
            person.setPassportIssueDate(new Date(personObj.passportIssueDate));
            person.setPassportIssuePlace(personObj.passportIssuePlace);
            person.setIdNumber(personObj.idNumber);
            person.setNationalNumber(personObj.nationalNumber);
            person.setRegisterationNumber(personObj.registerationNumber);
            person.setRestrictions(personObj.restrictions);
            person.setNotes(personObj.notes);
            person.setExtra(personObj.extra);
            return person;
        }))
        await session.close();
        return persons;
    }
    readById = async (id: string) => {
        const session = this.generateSession();
        const person = await session.run(`MATCH (p:Person) WHERE p.id = $id RETURN p`, { id }).then(result => {
            if (result.records.length === 0) throw Error('No such a person');
            const personObj = result.records[0].toObject().p.properties;
            const person = new Person(personObj.id);
            person.setFileNumber(personObj.fileNumber);
            person.setArabicName(personObj.arabicName);
            person.setEnglishName(personObj.englishNamen);
            person.setMotherName(personObj.motherName);
            person.setNickname(personObj.nickname);
            person.setBirthDate(new Date(personObj.birthDate));
            person.setBirthPlace(personObj.birthPlace);
            person.setJob(personObj.job);
            person.setNationality(personObj.nationality);
            person.setPhone(personObj.phone);
            person.setEmail(personObj.email);
            person.setWorkplace(personObj.workplace);
            person.setAddress(personObj.address);
            person.setGpsLocation(personObj.gpsLocation);
            person.setPassportNumber(personObj.passportNumber);
            person.setPassportIssueDate(new Date(personObj.passportIssueDate));
            person.setPassportIssuePlace(personObj.passportIssuePlace);
            person.setIdNumber(personObj.idNumber);
            person.setNationalNumber(personObj.nationalNumber);
            person.setRegisterationNumber(personObj.registerationNumber);
            person.setRestrictions(personObj.restrictions);
            person.setNotes(personObj.notes);
            person.setExtra(personObj.extra);
            return person;
        });
        await session.close();
        return person;
    }
    update = async (id: string, person: Person) => {
        const session = this.generateSession();
        await session.run(`
            MATCH (p:Person) WHERE id = $id
                SET
                    p.fileNumber = $fileNumber,
                    p.arabicName = $arabicName,
                    p.englishName = $englishName,
                    p.motherName = $motherName,
                    p.nickname = $nickname,
                    p.birthDate = $birthDate,
                    p.birthPlace = $birthPlace,
                    p.job = $job,
                    p.nationality = $nationality,
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
            })
        `, {
            id,
            fileNumber: person.fileNumber,
            arabicName: person.arabicName,
            englishName: person.englishName,
            motherName: person.motherName,
            nickname: person.nickname,
            birthDate: person.birthDate.toISOString(),
            birthPlace: person.birthPlace,
            job: person.job,
            nationality: person.nationality,
            phone: person.phone,
            email: person.email,
            workplace: person.workplace,
            address: person.address,
            gpsLocation: person.gpsLocation,
            passportNumber: person.passportNumber,
            passportIssueDate: person.passportIssueDate.toISOString(),
            passportIssuePlace: person.passportIssuePlace,
            idNumber: person.idNumber,
            nationalNumber: person.nationalNumber,
            registerationNumber: person.registerationNumber,
            restrictions: person.restrictions.map(v => v),
            notes: person.notes,
            extra: person.extra.map(v => v),
        });
        await session.close();
        return person;
    }
    delete = async (id: string) => {
        const session = this.generateSession();
        await session.run(`
            MATCH (p:Person { id: $id })
            OPTIONAL MATCH (p)-[r]->(o)
            WHERE NOT (r:CATEGORIZED_AS)
            DETACH DELETE r, o, p
        `, {
            id
        });
        await session.close();
    }
}
