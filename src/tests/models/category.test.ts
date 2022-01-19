import { v4 } from "uuid";
import { CategorySchema } from "../../models";

describe('Model: Category', () => {
	it('should indicate a valid category', async () => {
		const result = await CategorySchema.isValid({ id: v4(), name: 'test' });
		expect(result).toBeTruthy();
	});
	it('should indicate an invalid category', async () => {
		const result = await CategorySchema.isValid({ id: v4(), name: '' });
		expect(result).toBeFalsy();
	});
	it('should return a properly formatted error', async () => {
		try {
			await CategorySchema.validate({ id: '', name: 'test' });
		} catch (err) {
			expect((err as any).errors[0]).toBe('id must be a valid UUID');
		}
	});
});
