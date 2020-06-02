import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableBatchAction,
  TableBatchActions,
  TableToolbarAction,
  TableToolbarContent,
  TableSelectAll,
  TableSelectRow,
  TableToolbarMenu,
  TableToolbarSearch,
  Button,
} from 'carbon-components-react';
import {
  Delete32 as Delete,
  Save32 as Save,
  Download32 as Download,
} from '@carbon/icons-react';

function getHeaders(item = {}) {
  const capitalize = (name) => name.charAt(0).toUpperCase() + name.slice(1);
  return Object.keys(item)
    .filter((item) => item !== 'id')
    .map((key) => ({
      header: capitalize(key),
      key: key,
    }));
}

function getImages(data) {
  const imgs = [];
  let counter = 0;
  Object.entries(data).forEach(([releaseKey, release]) => {
    Object.entries(release).forEach(([componentKey, component]) => {
      const set_of_images = component['images'];
      set_of_images.forEach((image) => {
        imgs.push({ id: `${counter}`, ...image });
        counter++;
      });
    });
  });
  console.log(imgs);
  return imgs;
}

const fetchAPI = async (setter, api) => {
  try {
    const response = await fetch(api);
    const result = await response.json();
    setter(getImages(result));
  } catch (e) {
    setter({ error: `${e}` });
  }
};

const triggerFunction = async (type = String, selected = Array) => {
  const conf = window.confirm(`Are sure to trigger ${type}?`);
  if (conf) {
    const response = await axios.post(
      'http://192.168.99.100:8000/',
      selected.map(({ cells = Array }) => {
        let row = {};
        cells.forEach((cell) => {
          const rowName = cell['id'].split(':')[1];
          const rowValue = cell?.value || null;
          row = { ...row, [rowName]: rowValue };
        });
        return row;
      })
    );
    const status = await response.data;
    console.log('Your data: ');
    console.log(status);
  }
};

export default function () {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  useEffect(() => {
    fetchAPI(setData, 'http://192.168.99.100:8000/');
  }, []);
  useEffect(() => {
    setHeaders(getHeaders(data[0]));
  }, [data]);
  return (
    <div>
      <DataTable
        rows={data}
        headers={headers}
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getBatchActionProps,
          onInputChange,
          selectedRows,
        }) => (
          <TableContainer title="DataTable with batch actions">
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                <TableBatchAction
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? 0 : -1
                  }
                  renderIcon={Delete}
                  onClick={() => triggerFunction('delete', selectedRows)}
                >
                  Delete
                </TableBatchAction>
                <TableBatchAction
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? 0 : -1
                  }
                  renderIcon={Save}
                  onClick={() => triggerFunction('save', selectedRows)}
                >
                  Save
                </TableBatchAction>
                <TableBatchAction
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? 0 : -1
                  }
                  renderIcon={Download}
                  onClick={() => triggerFunction('download', selectedRows)}
                >
                  Download
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? -1 : 0
                  }
                  onChange={onInputChange}
                />
                <TableToolbarMenu
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? -1 : 0
                  }
                >
                  <TableToolbarAction
                    primaryFocus
                    onClick={() => alert('Alert 1')}
                  >
                    Action 1
                  </TableToolbarAction>
                  <TableToolbarAction onClick={() => alert('Alert 2')}>
                    Action 2
                  </TableToolbarAction>
                  <TableToolbarAction onClick={() => alert('Alert 3')}>
                    Action 3
                  </TableToolbarAction>
                </TableToolbarMenu>
                <Button
                  tabIndex={
                    getBatchActionProps().shouldShowBatchActions ? -1 : 0
                  }
                  onClick={() => console.log('clicked')}
                  size="small"
                  kind="primary"
                >
                  Add new
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    <TableSelectRow {...getSelectionProps({ row })} />
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  );
}
