import { Repository } from "../types";
import { Category } from "../models";

export class CategoryRepository extends Repository<Category, string> {
    create = async (category: Category) => {
        const session = this.generateSession()
        await session.run(`CREATE (c:Category { id: $id, name: $name })`, { id: category.id, name: category.name })
        await session.close();
        return category;
    }
    read = async () => {
        const session = this.generateSession()
        const categories = await session.run(`MATCH (c:Category) return c`).then(result => result.records.map(record => {
            const categoryObj = record.toObject().c.properties;
            const category = new Category(categoryObj.id);
            category.setName(categoryObj.name)
            return category;
        }));
        return categories;
    }
    readbyId = async (id: string) => {
        const session = this.generateSession();
        const category = await session.run(`MATCH (c:Category) WHERE c.id = $id RETURN c`, { id }).then(result => {
            if (result.records.length === 0) throw Error('No such a category');
            const category = new Category(id);
            category.setName(result.records[0].toObject().c.properties.name);
            return category;
        });
        await session.close();
        return category;
    }
    update = async (id: string, category: Category) => {
        const session = this.generateSession();
        await session.run(`MATCH (c:Category) WHERE c.id = $id SET c.name = $name`, { id, name: category.name });
        await session.close();
        return category;
    }
    delete = async (id: string) => {
        const session = this.generateSession();
        await session.run(`MATCH (c:Category) WHERE c.id = $id DETACH DELETE c`, { id });
        await session.close();
    }
}
