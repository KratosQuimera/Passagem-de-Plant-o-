import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Ticket, ShiftReport, AppSettings } from '../types';

export function exportTicketsToExcel(tickets: Ticket[], fileName: string = 'Relatorio_Plantao_TI') {
  const rows = tickets.map((t) => ({
    'ID': t.id,
    'Número Chamado': t.numero_chamado,
    'Prioridade': t.prioridade,
    'Área': t.area,
    'Problema': t.problema,
    'Status': t.status,
    'Próxima Ação': t.proxima_acao,
    'Responsável': t.responsavel,
    'Observações': t.observacoes,
    'Data Abertura': new Date(t.criado_em).toLocaleString('pt-BR'),
    'Criado Por': t.criado_por,
    'Última Atualização': new Date(t.atualizado_em).toLocaleString('pt-BR'),
    'Atualizado Por': t.atualizado_por,
    'Data Conclusão': t.concluido_em ? new Date(t.concluido_em).toLocaleString('pt-BR') : 'Em Aberto',
    'Concluído Por': t.concluido_por || '-',
    'Estado': t.arquivado ? 'Concluído/Arquivado' : 'Ativo no Painel',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chamados Plantão');

  // Auto column width
  const colWidths = [
    { wch: 15 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 },
    { wch: 16 },
    { wch: 28 },
    { wch: 20 },
    { wch: 35 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTicketsToCSV(tickets: Ticket[], fileName: string = 'Chamados_Plantao_TI') {
  const rows = tickets.map((t) => ({
    'Numero_Chamado': t.numero_chamado,
    'Prioridade': t.prioridade,
    'Area': t.area,
    'Problema': t.problema,
    'Status': t.status,
    'Proxima_Acao': t.proxima_acao,
    'Responsavel': t.responsavel,
    'Observacoes': t.observacoes.replace(/\n/g, ' '),
    'Data_Abertura': new Date(t.criado_em).toLocaleString('pt-BR'),
    'Data_Conclusao': t.concluido_em ? new Date(t.concluido_em).toLocaleString('pt-BR') : '',
    'Concluido_Por': t.concluido_por || '',
    'Arquivado': t.arquivado ? 'SIM' : 'NAO',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateShiftPDF(
  allTickets: Ticket[],
  shiftInfo: {
    data: string;
    horario: string;
    turno: string;
    responsavel: string;
    responsavelRecebimento?: string;
    resumo?: string;
    pendenciasNotas?: string;
  },
  settings: AppSettings
) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const nowStr = new Date().toLocaleString('pt-BR');

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 297, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE PASSAGEM DE PLANTÃO - TI', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${settings.unidade_hospitalar} | Emitido em: ${nowStr}`, 14, 20);

  // Shift metadata cards
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 32, 269, 20, 2, 2, 'F');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Data do Plantão: `, 18, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shiftInfo.data} (${shiftInfo.turno})`, 50, 40);

  doc.setFont('helvetica', 'bold');
  doc.text(`Horário: `, 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shiftInfo.horario}`, 35, 47);

  doc.setFont('helvetica', 'bold');
  doc.text(`Responsável Plantão: `, 115, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shiftInfo.responsavel}`, 155, 40);

  doc.setFont('helvetica', 'bold');
  doc.text(`Recebido por: `, 115, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shiftInfo.responsavelRecebimento || 'Próxima Equipe'}`, 145, 47);

  // Metrics
  const activeCount = allTickets.filter((t) => !t.arquivado).length;
  const resolvedCount = allTickets.filter((t) => t.arquivado || t.status === 'Resolvido').length;
  const pendingCount = allTickets.filter((t) => !t.arquivado && t.status === 'Pendente').length;
  const inProgressCount = allTickets.filter((t) => !t.arquivado && (t.status === 'Em andamento' || t.status === 'Em Atendimento')).length;
  const waitingCount = allTickets.filter((t) => !t.arquivado && t.status === 'Aguardando').length;

  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${allTickets.length}  |  Resolvidos: ${resolvedCount}  |  Pendentes: ${pendingCount}  |  Em Andamento: ${inProgressCount}  |  Aguardando: ${waitingCount}`, 200, 44, { align: 'right' });

  // TABLE 1: PENDÊNCIAS PARA O PRÓXIMO PLANTÃO (CRUCIAL)
  const pendingTickets = allTickets.filter((t) => !t.arquivado);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Red-700
  doc.text(`PENDÊNCIAS PARA O PRÓXIMO PLANTÃO (${pendingTickets.length} chamados em aberto)`, 14, 59);

  const pendingTableRows = pendingTickets.map((t) => [
    t.numero_chamado,
    t.prioridade,
    t.area,
    t.problema,
    t.status,
    t.proxima_acao,
    t.responsavel,
    t.observacoes || '-',
  ]);

  autoTable(doc, {
    startY: 62,
    head: [['CHAMADO', 'PRIORIDADE', 'ÁREA', 'PROBLEMA', 'STATUS', 'PRÓXIMA AÇÃO', 'RESPONSÁVEL', 'OBSERVAÇÕES']],
    body: pendingTableRows.length > 0 ? pendingTableRows : [['Nenhuma pendência ativa para este plantão.', '', '', '', '', '', '', '']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24 },
      1: { cellWidth: 20 },
      2: { cellWidth: 32 },
      3: { cellWidth: 35 },
      4: { cellWidth: 26 },
      5: { cellWidth: 42 },
      6: { cellWidth: 32 },
      7: { cellWidth: 58 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = String(data.cell.raw);
        if (val === 'P1') data.cell.styles.textColor = [220, 38, 38];
        if (val === 'P2') data.cell.styles.textColor = [234, 88, 12];
        if (val === 'P4') data.cell.styles.textColor = [22, 163, 74];
      }
    },
  });

  // TABLE 2: CHAMADOS CONCLUÍDOS / RESOLVIDOS NO PLANTÃO
  const concludedTickets = allTickets.filter((t) => t.arquivado || t.status === 'Resolvido');
  // @ts-expect-error jsPDF autotable lastAutoTable typing
  const finalY = doc.lastAutoTable.finalY + 10;

  if (finalY > 165) {
    doc.addPage();
  }

  const startY2 = finalY > 165 ? 20 : finalY;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); // Green-700
  doc.text(`CHAMADOS RESOLVIDOS / CONCLUÍDOS (${concludedTickets.length} registros)`, 14, startY2);

  const concludedTableRows = concludedTickets.map((t) => [
    t.numero_chamado,
    t.prioridade,
    t.area,
    t.problema,
    t.status,
    t.responsavel,
    t.concluido_por || t.atualizado_por,
    t.concluido_em ? new Date(t.concluido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
    t.observacoes || '-',
  ]);

  autoTable(doc, {
    startY: startY2 + 3,
    head: [['CHAMADO', 'PRIOR.', 'ÁREA', 'PROBLEMA', 'STATUS', 'RESPONSÁVEL', 'CONCLUÍDO POR', 'HORA', 'OBSERVAÇÕES']],
    body: concludedTableRows.length > 0 ? concludedTableRows : [['Nenhum chamado concluído neste plantão.', '', '', '', '', '', '', '', '']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 24 },
      1: { cellWidth: 16 },
      2: { cellWidth: 30 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 },
      7: { cellWidth: 18 },
      8: { cellWidth: 65 },
    },
  });

  // Footer & Signatures
  // @ts-expect-error jsPDF autotable lastAutoTable typing
  const finalY2 = doc.lastAutoTable.finalY + 12;
  const sigY = finalY2 > 175 ? 180 : finalY2;

  if (sigY > 170) {
    doc.addPage();
    doc.setPage(doc.getNumberOfPages());
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.line(20, sigY + 10, 100, sigY + 10);
  doc.text(`Entregador: ${shiftInfo.responsavel}`, 20, sigY + 15);

  doc.line(160, sigY + 10, 240, sigY + 10);
  doc.text(`Recebedor: ${shiftInfo.responsavelRecebimento || 'Próximo Plantonista'}`, 160, sigY + 15);

  doc.save(`Passagem_Plantao_TI_${shiftInfo.data.replace(/\//g, '-')}_${shiftInfo.turno.split(' ')[0]}.pdf`);
}
