import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { ReportPayload } from '../domain';
import { formatReportCell, getReportColumnClass } from './report-table.utils';

interface ReportResultsTableProps {
  data: ReportPayload;
}

export function ReportResultsTable({ data }: ReportResultsTableProps) {
  const { report, rows } = data;

  return (
    <Table className="w-max min-w-full table-auto">
      <TableHeader>
        <TableRow>
          {report.columns.map((column, index) => (
            <TableHead
              key={`${column}-${index}`}
              className={`${getReportColumnClass(column)} whitespace-normal break-words align-top leading-tight`}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {report.columns.map((column, columnIndex) => (
                <TableCell
                  key={columnIndex}
                  className={`${getReportColumnClass(column)} whitespace-normal break-words align-top leading-snug`}
                >
                  {formatReportCell(row[columnIndex])}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={report.columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              No hay resultados para los filtros aplicados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
