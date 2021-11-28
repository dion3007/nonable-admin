import React from 'react';
import { Button } from '@material-ui/core';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import plusFill from '@iconify/icons-eva/plus-fill';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

export const ExportCSV = ({ csvData, fileName }) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return (
    <Button
      variant="contained"
      onClick={() => exportToCSV(csvData, fileName)}
      startIcon={<Icon icon={plusFill} />}
    >
      Generate to excel
    </Button>
  );
};

ExportCSV.propTypes = {
  csvData: PropTypes.any,
  fileName: PropTypes.string
};
