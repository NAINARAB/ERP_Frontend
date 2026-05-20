/**
 * @typedef {Object} Column
 * @property {string} Field_Name
 * @property {'string'|'number'|'date'|'time'} [Fied_Data]
 * @property {string} [ColumnHeader]
 * @property {boolean} [isCustomCell]
 * @property {(row: object) => JSX.Element} [Cell]
 * @property {0|1} [isVisible]
 * @property {0|1} [Defult_Display]
 * @property {'left'|'right'|'center'} [align]
 * @property {'top'|'middle'|'bottom'} [verticalAlign]
 * @property {(props: {row: object, Field_Name: string, index: number}) => string} [tdClass]
 */

/**
 * @typedef {Object} Menu
 * @property {string} [name]
 * @property {JSX.Element} [icon]
 * @property {() => void} [onclick]
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} TableWrapperProps
 * @property {Array<Object>} dataArray
 * @property {Array<Column>} columns
 * @property {Function} [onClickFun]
 * @property {boolean} [isExpendable]
 * @property {JSX.Element|Function} [expandableComp]
 * @property {number} [tableMaxHeight]
 * @property {number} [initialPageCount]
 * @property {boolean} [EnableSerialNumber]
 * @property {'small'|'medium'|'large'} [CellSize]
 * @property {boolean} [disablePagination]
 * @property {string} [title]
 * @property {boolean} [PDFPrintOption]
 * @property {boolean} [ExcelPrintOption]
 * @property {boolean} [maxHeightOption]
 * @property {JSX.Element} [ButtonArea]
 * @property {Array<Menu>} [MenuButtons]
 * @property {number} [headerFontSizePx]
 * @property {number} [bodyFontSizePx]
 * @property {boolean} [enableFilters]
 */

import React, { useState, useMemo, useEffect, Fragment } from 'react';
import {
  Paper, Card, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, TableSortLabel, IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import FilterDialog from './FilterDialog';
import ColumnSettingsDialog from './ColumnSettingsDialog';
import TableActions from './TableActions';
import useFilteredData from './useFilteredData';
import { isEqualNumber, formatString } from './tableUtils';
import PropTypes from 'prop-types';

const TableWrapper = ({
  dataArray = [],
  columns: propsColumns = [],
  onClickFun = null,
  isExpendable = false,
  expandableComp = null,
  tableMaxHeight = 550,
  initialPageCount = 20,
  EnableSerialNumber = false,
  CellSize = 'small',
  disablePagination = false,
  title = '',
  PDFPrintOption = false,
  ExcelPrintOption = false,
  maxHeightOption = false,
  ButtonArea = null,
  MenuButtons = [],
  headerFontSizePx = 13,
  bodyFontSizePx = 13,
  enableFilters = false
}) => {
  const [columns, setColumns] = useState(propsColumns);
  const [filterDialog, setFilterDialog] = useState(false);
  const [columnDialog, setColumnDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageCount);
  const [sortCriteria, setSortCriteria] = useState([]);
  const [showFullHeight, setShowFullHeight] = useState(true);

  const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => (a?.OrderBy && b?.OrderBy ? a.OrderBy - b.OrderBy : 0));
  }, [columns]);

  const visibleColumns = useMemo(() => {
    return sortedColumns.filter(col =>
      isEqualNumber(col?.Defult_Display, 1) || isEqualNumber(col?.isVisible, 1)
    );
  }, [sortedColumns]);

  const {
    filters,
    setFilters,
    filteredData
  } = useFilteredData(dataArray, sortedColumns);

  const sortedData = useMemo(() => {
    const safeData = Array.isArray(filteredData) ? filteredData : [];
    if (!sortCriteria.length) return safeData;
    return [...safeData].sort((a, b) => {
      for (const { columnId, direction } of sortCriteria) {
        const aValue = a[columnId];
        const bValue = b[columnId];
        if (aValue !== bValue) {
          return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        }
      }
      return 0;
    });
  }, [filteredData, sortCriteria]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return Array.isArray(sortedData) ? sortedData.slice(start, start + rowsPerPage) : [];
  }, [sortedData, page, rowsPerPage]);

  const handleSortRequest = (columnId) => {
    const existing = sortCriteria.find(s => s.columnId === columnId);
    if (existing) {
      setSortCriteria(sortCriteria.map(s =>
        s.columnId === columnId
          ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
          : s
      ));
    } else {
      setSortCriteria([...sortCriteria, { columnId, direction: 'asc' }]);
    }
  };

  const RowComponent = ({ row, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <Fragment>
        <TableRow>
          {isExpendable && expandableComp && (
            <TableCell sx={{ fontSize: `${bodyFontSizePx}px` }}>
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </TableCell>
          )}
          {EnableSerialNumber && (
            <TableCell sx={{ fontSize: `${bodyFontSizePx}px` }}>
              {(rowsPerPage * page) + index + 1}
            </TableCell>
          )}
          {visibleColumns.map((col, i) => (
            <TableCell
              key={i}
              sx={{ fontSize: `${bodyFontSizePx}px` }}
              onClick={() => onClickFun?.(row)}
            >
              {col?.isCustomCell && col?.Cell
                ? col.Cell({ row, Field_Name: col.Field_Name, index })
                : formatString(row[col.Field_Name], col?.Fied_Data)}
            </TableCell>
          ))}
        </TableRow>
        {expanded && expandableComp && (
          <TableRow>
            <TableCell colSpan={visibleColumns.length + (EnableSerialNumber ? 1 : 0) + (isExpendable ? 1 : 0)}>
              {expandableComp({ row, index })}
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };

  return (
    <Card className="rounded-3 bg-white overflow-hidden" component={Paper}>
      <div className="d-flex align-items-center justify-content-between px-3 py-2">
        <TableActions
          dataArray={filteredData}
          columns={visibleColumns}
          PDFPrintOption={PDFPrintOption}
          ExcelPrintOption={ExcelPrintOption}
          MenuButtons={MenuButtons}
          setShowFullHeight={setShowFullHeight}
          showFullHeight={showFullHeight}
          maxHeightOption={maxHeightOption}
          enableFilters={enableFilters}
          setFilterDialog={setFilterDialog}
        />
        {ButtonArea && ButtonArea}
        {title && <h6 className="fw-bold text-muted m-0">{title}</h6>}
      </div>

      <TableContainer sx={{ maxHeight: showFullHeight && maxHeightOption ? 'max-content' : tableMaxHeight }}>
        <Table stickyHeader size={CellSize}>
          <TableHead>
            <TableRow>
              {isExpendable && expandableComp && (
                <TableCell sx={{ fontSize: `${headerFontSizePx}px` }}>#</TableCell>
              )}
              {EnableSerialNumber && (
                <TableCell sx={{ fontSize: `${headerFontSizePx}px` }}>SNo</TableCell>
              )}
              {visibleColumns.map((col, i) => {
                const match = sortCriteria.find(c => c.columnId === col.Field_Name);
                return (
                  <TableCell
                    key={i}
                    sx={{ fontSize: `${headerFontSizePx}px` }}
                    sortDirection={match?.direction || false}
                  >
                    <TableSortLabel
                      active={!!match}
                      direction={match?.direction || 'asc'}
                      onClick={() => handleSortRequest(col.Field_Name)}
                    >
                      {col.ColumnHeader || col.Field_Name}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {(disablePagination ? sortedData : paginatedData).map((row, i) => (
              <RowComponent key={i} row={row} index={i} />
            ))}
            {!filteredData.length && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (EnableSerialNumber ? 1 : 0) + (isExpendable ? 1 : 0)} align="center">
                  No Data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!disablePagination && filteredData.length > 0 && (
        <div className="p-2 pb-0">
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            labelRowsPerPage="Rows per page"
            showFirstButton
            showLastButton
          />
        </div>
      )}

      {enableFilters && (
        <Fragment>
          <FilterDialog
            open={filterDialog}
            onClose={() => setFilterDialog(false)}
            columns={visibleColumns}
            filters={filters}
            setFilters={setFilters}
            dataArray={dataArray}
            setColumnDialog={setColumnDialog}
          />
          <ColumnSettingsDialog
            open={columnDialog}
            onClose={() => setColumnDialog(false)}
            columns={columns}
            setColumns={setColumns}
            originalColumns={propsColumns}
          />
        </Fragment>
      )}
    </Card>
  );
};

export default TableWrapper;

TableWrapper.propTypes = {
  dataArray: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClickFun: PropTypes.func,
  isExpendable: PropTypes.bool,
  expandableComp: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  tableMaxHeight: PropTypes.number,
  initialPageCount: PropTypes.number,
  EnableSerialNumber: PropTypes.bool,
  CellSize: PropTypes.oneOf(['small', 'medium', 'large']),
  disablePagination: PropTypes.bool,
  title: PropTypes.string,
  PDFPrintOption: PropTypes.bool,
  ExcelPrintOption: PropTypes.bool,
  maxHeightOption: PropTypes.bool,
  ButtonArea: PropTypes.element,
  MenuButtons: PropTypes.arrayOf(PropTypes.object),
  headerFontSizePx: PropTypes.number,
  bodyFontSizePx: PropTypes.number,
  enableFilters: PropTypes.bool
};

TableWrapper.defaultProps = {
  onClickFun: null,
  isExpendable: false,
  expandableComp: null,
  tableMaxHeight: 550,
  initialPageCount: 20,
  EnableSerialNumber: false,
  CellSize: 'small',
  disablePagination: false,
  title: undefined,
  PDFPrintOption: false,
  ExcelPrintOption: false,
  maxHeightOption: false,
  ButtonArea: null,
  MenuButtons: [],
  headerFontSizePx: 13,
  bodyFontSizePx: 13,
  enableFilters: false
};