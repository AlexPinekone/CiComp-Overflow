'use client';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { all, createLowlight } from 'lowlight';
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold as BoldI,
	Italic as ItalicI,
	PaintBucket,
	Quote,
	Strikethrough,
	Underline as UnderlineI,
	Code,
	Image as ImageI,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import styles from './RichTextEditor.module.css';
// import { set } from 'date-fns';

const lowlight = createLowlight(all);

const imageTagRegex = /<img[^>]+src="([^">]+)"/;

const extensions = [
	Document,
	Paragraph,
	Text,
	TextStyle,
	Underline,
	Color,
	Blockquote,
	History,
	Bold,
	Italic,
	Image,
	TextAlign.configure({
		types: ['heading', 'paragraph'],
	}),
	CodeBlockLowlight.configure({
		lowlight,
	}),
];

const Tiptap = ({
	content,
	readOnly = false,
	form,
	onChange,
}: {
	content?: string;
	readOnly?: boolean;
	form?: string;
	onChange?: (html: string) => void;
}) => {
	const [disabledImage, setDisabledImage] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [body, setBody] = useState(content || '');

	const currentContent = useRef(content);

	useEffect(() => {
		currentContent.current = content;
	}, [content]);

	const editor = useEditor({
		extensions,
		content,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			const newContent = editor.getHTML();
			if (newContent !== currentContent.current && newContent !== body) {
				setBody(newContent);
				onChange?.(newContent);
			}
		},

		editorProps: {
			handleKeyDown(view, event) {
				if (event.key === 'Tab') {
					event.preventDefault();
					view.dispatch(view.state.tr.insertText('    ')); // Agrega 4 espacios como un tab
					return true;
				}
			},
		},
	});

	editor?.setEditable(!readOnly);
	const [currentColor, setCurrentColor] = useState('#000000');
	const html = editor?.getHTML?.();

	useEffect(() => {
		if (!imageTagRegex.test(html ?? '')) {
			setImage(null);
			setDisabledImage(false);
		} else {
			setDisabledImage(true);
		}
	}, [html]);

	if (!editor) {
		return null;
	}

	const handleBody = () => {
		const body = editor.getHTML();
		try {
			setBody(body);
			onChange?.(body);
		} catch (error) {
			console.error(error);
		}
	};

	const handleImage = () => {
		if (disabledImage) return;

		if (!imageInputRef.current) return;
		imageInputRef.current.click();
		imageInputRef.current.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const url = URL.createObjectURL(file);
			editor
				.chain()
				.focus()
				.setImage({
					src: url,
					alt: file.name,
					title: file.name,
				})
				.run();

			if (file) {
				setDisabledImage(true);
				setImage(file);
			}
		};
	};

	return (
		<div className="rounded w-full">
			<div className="hidden">
				<label htmlFor="image" />
				<input
					ref={imageInputRef}
					name="image"
					type="file"
					accept="image/*"
					form={form}
				/>
				<label htmlFor="body" />
				<textarea
					readOnly
					form={form}
					value={body}
					onChange={() => {}}
					name="body"
					placeholder="Escribe tu post"
					rows={10}
				/>
			</div>
			{!readOnly && (
				<ToggleGroup
					className="w-full h-12 bg-slate-200 "
					type="multiple">
					<ToggleGroupItem
						value="bold"
						aria-label="Toggle bold"
						onClick={() =>
							editor.chain().focus().toggleBold().run()
						}>
						<BoldI className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="italic"
						aria-label="Toggle italic"
						onClick={() =>
							editor.chain().focus().toggleItalic().run()
						}>
						<ItalicI className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="blockquote"
						aria-label="Toggle underline"
						onClick={() =>
							editor.chain().focus().toggleBlockquote().run()
						}>
						<Quote className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="image"
						aria-label="Insert image"
						disabled={disabledImage}
						onClick={handleImage}>
						<ImageI className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="code"
						aria-label="Toggle code"
						onClick={() =>
							editor.chain().focus().toggleCodeBlock().run()
						}>
						<Code className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="underline"
						aria-label="Toggle underline"
						onClick={() =>
							editor.chain().focus().toggleUnderline().run()
						}>
						<UnderlineI className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="color-picker"
						aria-label="Select color"
						className="relative flex flex-col gap-0">
						<PaintBucket className="h-2 w-2 my-0" />
						<Input
							type="color"
							className="w-full opacity-0 absolute h-full border"
							value={currentColor}
							onChange={(e) => {
								editor
									.chain()
									.focus()
									.setColor(e.target.value)
									.run();
								setCurrentColor(e.target.value);
							}}
							placeholder="Select color"
							title="Select color"
						/>
						<div
							className="h-1 w-full border"
							style={{ backgroundColor: currentColor }}></div>
					</ToggleGroupItem>
					<ToggleGroupItem
						value="strikethrough"
						aria-label="Toggle strikethrough"
						onClick={() =>
							editor.chain().focus().toggleStrike().run()
						}>
						<Strikethrough className="h-4 w-4" />
					</ToggleGroupItem>
					{/* Align text */}
					<ToggleGroupItem
						value="align-left"
						aria-label="Align text left"
						onClick={() =>
							editor.chain().focus().setTextAlign('left').run()
						}>
						<AlignLeft className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="align-center"
						aria-label="Align text center"
						onClick={() =>
							editor.chain().focus().setTextAlign('center').run()
						}>
						<AlignCenter className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="align-right"
						aria-label="Align text right"
						onClick={() =>
							editor.chain().focus().setTextAlign('right').run()
						}>
						<AlignRight className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="align-justify"
						aria-label="Align text justify"
						onClick={() =>
							editor.chain().focus().setTextAlign('justify').run()
						}>
						<AlignJustify className="h-4 w-4" />
					</ToggleGroupItem>
				</ToggleGroup>
			)}

			<EditorContent
				id="editor"
				onBlur={handleBody}
				editor={editor}
				className={styles.editor}
			/>
		</div>
	);
};

export default Tiptap;
