import { Separator } from '@/components/ui/separator';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { User } from 'lucide-react';
export default function PostCard({ post }: any) {
	const { title, body, userName, tags } = post;
	const tmpEditor = new Editor({
		content: body,
		enableInputRules: false,
		extensions: [StarterKit],
	});

	const editorBody = tmpEditor.getText();
	return (
		<div className="border border-gray-200 rounded-lg p-6 shadow-md bg-white flex flex-col hover:shadow-lg transition-shadow relative">
			{/* Contenedor de votos */}
			<div className="absolute top-2 right-2 flex ">
				<div className="p-1 text-black/50 hover:none bg-black/10 flex gap-[1px] rounded-lg [ [&>p]:text-center [&>p]:font-medium [&>p]:text-xs ">
					<p>▲{post.upVoteCount ?? 0}</p>
					<Separator
						orientation="vertical"
						decorative
						className="mx-1 bg-black/20"
					/>
					<p>▼{post.downVoteCount ?? 0}</p>
				</div>
			</div>

			{/* Título y contenido */}
			<div className="flex-1">
				<h2 className="text-3xl font-semibold text-[#002E5E]">
					{title}
				</h2>
				<p className="text-gray-700 mt-4 line-clamp-3">{editorBody}</p>
			</div>

			{/* Etiquetas */}
			{tags && tags.length > 0 && (
				<div className="mt-4 flex flex-wrap gap-2">
					{tags.map((tag: string, index: number) => (
						<span
							key={index}
							className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
							{tag}
						</span>
					))}
				</div>
			)}
			{/* Autor */}
			<div className="mt-4 flex items-center justify-end text-gray-800">
				<div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
					<User className="w-5 h-5 text-gray-500 mr-2" />
					<span className="text-sm font-medium text-gray-700">
						{userName}
					</span>
				</div>
			</div>
		</div>
	);
}
