export { default as GroupingPanel } from './components/GroupingPanel';
export { default as ColumnSettingsDialog } from './components/ColumnSettingsDialog';
export { default as FilterRow } from './components/FilterRow';
export { default as StateSaveDialog } from './components/StateSaveDialog';
export { default as TableOptionsMenu } from './components/TableOptionsMenu';
export { default as AppTableComponent } from './appTableComponent';

// ─────────────────────────────────────────────────────────────────────────────
// Column definition helper – gives IDE autocomplete in plain JSX files.
// Usage:
//   import { defineColumn, defineColumns } from 'src/Components/appTable';
//
//   const columns = defineColumns([
//       defineColumn({ Field_Name: 'Amount', ColumnHeader: 'Amount', Fied_Data: 'number', isVisible: 1 }),
//       defineColumn({ Field_Name: 'Name',   ColumnHeader: 'Name',   Fied_Data: 'string', isVisible: 1,
//           isCustomCell: true,
//           Cell: ({ row }) => <span>{row.Name}</span>,
//           FooterCell: ({ data }) => <strong>{data.length}</strong>,
//       }),
//   ]);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape of a single column definition for AppTableComponent.
 *
 * You can get autocomplete on a plain array with:
 *
 * @example
 * // At the top of your file:
 * // @ts-check
 *
 * /** @type {import('src/Components/appTable').ColumnDef[]} *\/
 * const columns = [
 *     { Field_Name: 'Amount', Fied_Data: 'number', isVisible: 1 },
 * ];
 *
 * @typedef {{
 *   Field_Name:    string,
 *   ColumnHeader?: string,
 *   Fied_Data?:   'number' | 'date' | 'time' | 'string',
 *   isVisible?:   0 | 1,
 *   OrderBy?:     number,
 *   Aggregation?: 'sum' | 'mean' | 'median' | 'min' | 'max' | 'count' | '',
 *   isCustomCell?: boolean,
 *   Cell?:        (props: { row: object }) => any,
 *   FooterCell?:  (props: { data: object[] }) => any,
 * }} ColumnDef
 */

/**
 * Define a single column — identity helper that gives autocomplete in JSX.
 * @param {ColumnDef} columnDef
 * @returns {ColumnDef}
 */
export const defineColumn = (columnDef) => columnDef;

/**
 * Define an array of columns for AppTableComponent.
 * Equivalent to wrapping each item in defineColumn().
 * Provided as a convenience so you can pass the whole array in one call.
 *
 * @param {ReturnType<typeof defineColumn>[]} columnDefs
 * @returns {object[]}
 */
export const defineColumns = (columnDefs) => columnDefs;

