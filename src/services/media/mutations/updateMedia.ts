import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import * as yup from 'yup';
import { getRepository } from 'typeorm';
import { MediaEntity } from '@database/entities/MediaEntity';
import { makeGraphqlError } from '@utils/error';
import { ErrorCodes } from '@/__test__/graphql/sdk';

export const updateMedia: MutationResolvers['updateMedia'] = async (_, { data }) => {
  const mediaRepo = getRepository(MediaEntity);
  const { id } = data;
  const { description, title } = await validateInput(data);
  await mediaRepo.update({ id }, { title, description });

  const media = await mediaRepo.findOne({ where: { id } });
  if (!media) throw makeGraphqlError('Media not found', ErrorCodes.BadUserInput);
  return media;
};

const validateInput = async (input: { title?: string; description?: string }) => {
  const schema = yup.object().shape({
    title: yup.string().trim().max(255),
    description: yup.string().trim().max(512),
  });

  return schema.validate(input);
};
