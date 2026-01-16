import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export default function GeneratePDFButton() {
	const handleGeneratePDF = () => {
		const contentRef = document.getElementById('pdf-content');
		if (!contentRef) {
			console.error('El elemento de referencia no está disponible.');
			return;
		}

		html2canvas(contentRef, { scale: 3, backgroundColor: '#fff' }).then(
			(canvas) => {
				const pdf = new jsPDF('p', 'mm', 'a4');

				const pageWidth = 210;
				const pageHeight = 289;

				const marginX = 10;
				const marginY = 20;

				const imgWidth = pageWidth - marginX * 2;
				const imgHeight = (canvas.height * imgWidth) / canvas.width;

				const pageHeightPx =
					(canvas.width / imgWidth) * (pageHeight - marginY);

				// canvas temporal para recortar porciones
				const pageCanvas = document.createElement('canvas');
				const pageCtx = pageCanvas.getContext('2d')!;

				let renderedHeight = 0;
				let page = 0;

				while (renderedHeight < canvas.height) {
					pageCanvas.width = canvas.width;
					pageCanvas.height = pageHeightPx;

					// limpiar antes de dibujar
					pageCtx.fillStyle = '#fff';
					pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

					// copiar la parte visible
					pageCtx.drawImage(
						canvas,
						0,
						renderedHeight,
						canvas.width,
						pageHeightPx,
						0,
						0,
						canvas.width,
						pageHeightPx
					);

					const imgData = pageCanvas.toDataURL('image/png');

					if (page > 0) pdf.addPage();
					const yPos = page === 0 ? 0 : marginY;
					pdf.addImage(
						imgData,
						'PNG',
						marginX,
						yPos,
						imgWidth,
						pageHeight - marginY
					);

					renderedHeight += pageHeightPx;
					page++;
				}

				pdf.save('documento.pdf');
			}
		);
	};

	return (
		<button
			onClick={handleGeneratePDF}
			className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
			Generar PDF
		</button>
	);
}
