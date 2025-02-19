"use client";
import styles from "./index.module.css";
import {
  RowTableI,
  TableComponentI,
  TableComponentProps,
} from "@/typings/components";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FC } from "react";
import { IconButton } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(46, 62, 79, 0.9)",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const TableComponent: FC<TableComponentProps> = ({
  header,
  rows,
  indexKey,
  deleteAction,
  editAction,
}) => {
  return (
    <Table sx={{ minWidth: 300, width: "100%" }} aria-label="customized table">
      <TableHead>
        <TableRow>
          {header.map((item: RowTableI) => (
            <StyledTableCell align="center" key={`${item.key}`}>
              {item.label}
            </StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row: TableComponentI, index: number) => {
            return (
              <StyledTableRow key={`${row.key}-${row.data?.[indexKey]?.label}`}>
                {row.data.map((item: RowTableI, index: number) => (
                  <StyledTableCell align="center" key={`${row.key}-${row.data?.[index]?.label}`}>
                    {item.label}
                  </StyledTableCell>
                ))}
                {/* Actions */}
                <StyledTableCell align="center">
                  <div className={styles.actions}>
                    <IconButton
                      size="medium"
                      onClick={() => editAction(row.key, row.data?.[0]?.label, index)}
                    >
                      <EditIcon className={styles.edit} />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        deleteAction(row.key, row.data?.[0]?.label, index)
                      }
                      size="medium"
                    >
                      <DeleteIcon className={styles.delete} />
                    </IconButton>
                  </div>
                </StyledTableCell>
              </StyledTableRow>
            );
          })
        ) : (
          <p className={styles.empty}>Sin datos</p>
        )}
      </TableBody>
    </Table>
  );
};

export default TableComponent;
