import { Post } from '@/model/Post';
import { User } from '@/model/User';
// import { Tag } from "@/model/Tags";

export interface PostWithAuthor extends Post {
	author: Pick<User, 'name' | 'lastName'>;
	tags: string[]; // ⬅ Ahora es un arreglo de objetos con "tagName"
}
