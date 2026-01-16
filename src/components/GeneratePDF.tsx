'use client';

import { useRef, useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getPostsCountLastMonth, getTotalPostsCount } from '@/actions/post';
import { getTotalRequestsCount } from '@/actions/requests';
import { getPostVotesCountLastMonth } from '@/actions/post';
import { getActiveUsersLastMonth } from '@/actions/user';
import { getCommentsCountLastMonth } from '@/actions/comment';
import GeneratePDFButton from './GeneratePDFButton';

const GeneratePDF = () => {
	const contentRef = useRef<HTMLDivElement | null>(null);

	const [totalPosts, setTotalPosts] = useState(0);
	const [recentPosts, setRecentPosts] = useState(0);
	const [totalRequests, setTotalRequests] = useState(0);
	const [recentComments, setRecentComments] = useState(0);
	const [recentVotes, setTotalPostVotes] = useState(0);
	const [activeUsers, setActiveUsers] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [
					{ count: total = 0 },
					{ count: recent = 0 },
					{ count: requests = 0 },
					{ count: comments = 0 },
					{ count: postvotes = 0 },
					{ count: activeuser = 0 },
				] = await Promise.all([
					getTotalPostsCount(),
					getPostsCountLastMonth(),
					getTotalRequestsCount(),
					getCommentsCountLastMonth(),
					getPostVotesCountLastMonth(),
					getActiveUsersLastMonth(),
				]);
				setTotalPosts(total);
				setRecentPosts(recent);
				setTotalRequests(requests);
				setRecentComments(comments);
				setTotalPostVotes(postvotes);
				setActiveUsers(activeuser);
			} catch (error) {
				console.error('Error al obtener los datos:', error);
			}
		};

		fetchData();
	}, []);

	const handleGeneratePDF = () => {
		if (!contentRef.current) {
			console.error('El elemento de referencia no está disponible.');
			return;
		}

		html2canvas(contentRef.current, {
			scale: 3,
			backgroundColor: '#ffffff',
		}).then((canvas) => {
			const imgData = canvas.toDataURL('image/png');

			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4',
			});

			const marginX = 30;
			const marginY = 40;

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();

			const imgWidth = pageWidth - 2 * marginX;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			let heightLeft = imgHeight;
			let position = marginY;

			pdf.addImage(
				imgData,
				'PNG',
				marginX,
				position,
				imgWidth,
				imgHeight
			);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				pdf.addPage();
				position = marginY - heightLeft;
				pdf.addImage(
					imgData,
					'PNG',
					marginX,
					position,
					imgWidth,
					imgHeight
				);
				heightLeft -= pageHeight - 2 * marginY;
			}

			pdf.save('documento.pdf');
		});
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen space-y-6">
			{/* Contenido que se convertirá en PDF */}
			<div
				id="pdf-content"
				ref={contentRef}
				className="bg-white w-[600px] p-10 rounded-lg shadow-lg text-justify-center 
					transform scale-100 origin-top ">
				{/* Nombre de la plataforma centrado */}
				<div className="mb-2">
					<h2 className="text-xl font-bold text-center text-gray-800">
						CiComp Overflow
					</h2>
				</div>
				<div className="mb-6">
					<img
						src="/ciCompLogo.svg"
						alt="Logo"
						className="w-20 h-20 mx-auto"
					/>
				</div>

				{/* Título centrado y línea horizontal */}
				<h1 className="text-2xl font-bold mb-2 text-center">
					Reporte de actividad mensual
				</h1>
				<hr className="mb-6 border-gray-300" />

				<div className="text-gray-700 mb-8 text-sm leading-relaxed space-y-4">
					<p>
						El presente documento constituye un reporte mensual de
						la actividad registrada en la plataforma. Su objetivo es
						ofrecer una visión general del comportamiento de los
						usuarios y del rendimiento del sistema durante el
						periodo señalado, a fin de apoyar en la toma de
						decisiones estratégicas y en la evaluación continua de
						la operación.
					</p>

					<p>
						La información aquí contenida incluye datos sobre la
						creación de publicaciones, solicitudes y métricas de uso
						relevantes para comprender la evolución de la comunidad.
						Estos indicadores permiten identificar tendencias,
						posibles áreas de mejora y oportunidades de crecimiento
						dentro del entorno académico y tecnológico que respalda
						la plataforma.
					</p>

					<p>
						Este reporte tiene fines meramente informativos y no
						constituye un compromiso contractual. Los datos han sido
						procesados de manera agregada, respetando en todo
						momento la confidencialidad de la información personal
						de los usuarios.
					</p>

					<p className="text-xs italic text-gray-500">
						Nota legal: La información presentada es propiedad de la
						plataforma y su reproducción total o parcial sin
						autorización está estrictamente prohibida. Cualquier uso
						indebido podrá ser sujeto a las sanciones previstas en
						la normativa aplicable.
					</p>
				</div>

				{/* Tabla de datos */}
				<div className="overflow-x-auto">
					<table className="table-auto border-collapse w-full text-left">
						<thead>
							<tr className="bg-gray-200">
								<th className="border px-4 py-2 text-gray-800">
									Métrica
								</th>
								<th className="border px-4 py-2 text-gray-800">
									Valor
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="border px-4 py-2">
									Número total de posts
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{totalPosts}
								</td>
							</tr>
							<tr className="bg-gray-50">
								<td className="border px-4 py-2">
									Número de posts el último mes
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{recentPosts}
								</td>
							</tr>
							<tr>
								<td className="border px-4 py-2">
									Número total de solicitudes
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{totalRequests}
								</td>
							</tr>
							<tr className="bg-gray-50">
								<td className="border px-4 py-2">
									Número de comentarios el último mes
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{recentComments}
								</td>
							</tr>
							<tr>
								<td className="border px-4 py-2">
									Número de votos el último mes
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{recentVotes}
								</td>
							</tr>
							<tr>
								<td className="border px-4 py-2">
									Número de usuarios activos
								</td>
								<td className="border px-4 py-2 font-semibold text-center">
									{activeUsers}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Botón para generar el PDF */}
			<GeneratePDFButton />
		</div>
	);
};

export default GeneratePDF;
