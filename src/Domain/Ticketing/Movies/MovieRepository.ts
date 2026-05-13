import type { Repository } from '@/Domain/Shared/mod.ts';
import { Movie, MovieId } from './Movie.ts';

export interface MovieRepository extends Repository<Movie, MovieId> {}
