'use client';
import { updateProfile } from '@/actions/profile';
import { getUserProfileDataBySessionOrId } from '@/actions/user';
import Medal from '@/components/Medal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/constants/session';
import { SessionContext } from '@/providers/SessionProvider';
import {
	BadgeCheckIcon,
	Flag,
	Pencil,
	StarIcon,
	TrophyIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useActionState, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface UserData {
	name?: string;
	lastName?: string;
	description?: string;
	userName?: string;
}
export default function ProfileConfigPage() {
	const { id } = useParams();
	const [state, updateProfileAction] = useActionState(
		(_: any, payload: FormData) => updateProfile(payload, id as string),
		undefined
	);
	const inputImageRef = useRef<HTMLInputElement>(null);

	const [userData, setUserData] = useState<UserData>({});
	const sessionContext = useContext(SessionContext);
	const { session } = sessionContext ?? {};
	const role = session?.role;
	const sessionUserId = session?.userId;

	const isCurrentUser = sessionUserId === id;
	const isAdmin = role === UserRole.ADMIN;
	const [photo, setPhoto] = useState('');

	useEffect(() => {
		getUserProfileDataBySessionOrId(id).then((data) => {
			if (data) {
				setUserData(data);
				setPhoto(data.photo);
			}
		});
	}, [id]);

	useEffect(() => {
		const input = inputImageRef.current;
		if (!input) return;

		const handleChange = () => {
			const file = input.files?.[0];
			if (file) {
				const url = URL.createObjectURL(file);
				setPhoto(url);
			}
		};

		input.addEventListener('change', handleChange);

		// Cleanup
		return () => {
			input.removeEventListener('change', handleChange);
		};
	}, []);

	useEffect(() => {
		if (state?.errors) {
			const lastValue = Object.values(state.errors).at(-1);
			toast.error(lastValue);
			return;
		}
		if (state?.success) {
			toast.success(state.success);
			// Recargar datos del usuario para mostrar cambios actualizados
			getUserProfileDataBySessionOrId(id).then((data) => {
				if (data) {
					setUserData(data);
					setPhoto(data.photo);
				}
			});
		}
	}, [state, id]);

	const handleDeleteClick = () => {
		handleDeleteUser(id as string);
	};

	const handleDeleteUser = async (id: string) => {
		if (window.confirm('¿Estás seguro de suspender este usuario?')) {
			try {
				const response = await fetch(`/api/admin/user/${id}`, {
					method: 'PUT',
				});

				if (response.ok) {
					alert('Usuario suspendido correctamente');
				} else {
					alert('Error al suspender el usuario');
				}
			} catch (error) {
				console.error('Error al suspender el usuario:', error);
			}
		}
	};

	return (
		<div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
			<div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
				{/* Foto de Perfil */}
				<div className="  ">
					<div className="relative size-fit ">
						<Avatar className="size-64 aspect-square border-4 border-tertiary rounded-full shadow-md hover:opacity-80 transition-opacity">
							<AvatarImage
								src={photo}
								alt="Foto de perfil"
								className="rounded-full w-full aspect-square  object-cover"
							/>
							<AvatarFallback className="bg-gray-200 text-gray-500  w-full aspect-square text-4xl">
								{`${userData?.name?.charAt(0) ?? ''}${
									userData?.lastName?.charAt(0) ?? ''
								}`}
							</AvatarFallback>
						</Avatar>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => inputImageRef?.current?.click?.()}
							className="absolute bottom-2 right-8 bg-white rounded-full shadow-md p-1 border z-10 border-primary hover:bg-primary *:hover:text-white">
							<Pencil className="w-5 h-5 text-primary" />
						</Button>
						{isAdmin && !isCurrentUser && (
							<Button
								size="icon"
								className="absolute top-8 right-2  hover:bg-white rounded-full shadow-md p-1 hover:border z-10 hover:border-red-600 bg-red-600 text-white hover:text-red-600"
								variant="ghost"
								onClick={handleDeleteClick}>
								<Flag className="w-5 h-5" />
							</Button>
						)}
					</div>
				</div>

				<div className="text-center mt-4">
					<h1 className="text-2xl font-bold text-primary">
						{[userData.name, userData?.lastName].join(' ')}
					</h1>
					<p className="mt-2 text-gray-600 text-sm max-w-xs">
						@{userData.userName}
					</p>
					<p className="mt-2 text-gray-600 text-sm max-w-xs">
						{userData?.description ?? 'Sin descripción'}
					</p>
				</div>

				{/* Formulario de actualización */}
				<form
					className="w-full max-w-md space-y-4 mt-6"
					action={updateProfileAction}>
					{/* Campo: Username */}
					<div>
						<Input
							ref={inputImageRef}
							type="file"
							name="photo"
							id="photo"
							accept="image/*"
							title="Seleccionar imagen de perfil"
							className="mt-4 hidden"
						/>
						<Label htmlFor="userName" className="text-primary">
							Username
						</Label>
						<Input
							id="userName"
							name="userName"
							type="text"
							defaultValue={userData?.userName ?? ''}
							className="mt-1"
						/>
					</div>

					{/* Campo: Descripción */}
					<div>
						<Label htmlFor="description" className="text-primary">
							Descripción
						</Label>
						<Input
							id="description"
							name="description"
							type="text"
							defaultValue={userData?.description ?? ''}
							placeholder="Ingresa una descripción"
							className="mt-1"
						/>
					</div>

					{/* Botones de acción */}
					<div className="flex justify-between mt-6">
						<Button
							type="reset"
							className="bg-secondary text-white hover:bg-secondary/90">
							Cancelar / Restablecer
						</Button>
						<Button
							type="submit"
							className="bg-primary text-white hover:bg-primary/90">
							Guardar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
