import * as yup from 'yup';

export const CategorySchema = yup.object().shape({
	id: yup.string().uuid().required(),
	name: yup.string().required(),
});
