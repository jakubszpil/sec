import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { StackedBarChart as Chart } from '@carbon/charts-react';
import {
  Link,
  Modal,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableExpandRow,
  TableExpandedRow,
  TableBatchAction,
  TableBatchActions,
  TableExpandHeader,
  TableToolbarAction,
  TableToolbarContent,
  TableSelectAll,
  TableSelectRow,
  TableToolbarMenu,
  TableToolbarSearch,
  Button,
  ModalBody,
  ModalHeader,
} from 'carbon-components-react';
import {
  Run32 as RunIcon,
  SkillLevelAdvanced16 as HighLevel,
  SkillLevelIntermediate16 as MediumLevel,
  SkillLevelBasic16 as LowLevel,
  SkillLevel16 as BasicLevel,
} from '@carbon/icons-react';

// initial headers of table
const initialHeaders = [
  'Name',
  'Url',
  'Tag',
  'OSS',
  'VA',
  'Static',
].map((item) => ({ key: item.toLowerCase(), header: item }));

// function that getting images from api from json and returning them in array
function getImages(data) {
  let imgs = [];
  let counter = 0;
  Object.entries(data).forEach(([releaseKey, release]) => {
    Object.entries(release).forEach(([componentKey, component]) => {
      const set_of_images = component['images'];
      set_of_images.forEach((image) => {
        imgs.push({
          id: `${counter}`,
          name: image?.name || '',
          url: image?.url || '',
          tag: image?.tag || '',
          scanLinks: image?.scanLinks || [],
          oss: image?.results?.oss || {},
          va: image?.results?.va || {},
          static: image?.results?.static || {},
          results: image?.results || [],
        });
        counter++;
      });
    });
  });
  return imgs;
}

// components
const Level = (props) => {
  switch (props.level) {
    case 'low':
      return <LowLevel {...props} fill="yellow" />;
    case 'medium':
      return <MediumLevel {...props} fill="orange" />;
    case 'high':
      return <HighLevel {...props} fill="red" />;
    default:
      return <BasicLevel {...props} />;
  }
};
const ChartModal = ({ data, handleChartClose, opened }) => {
  const options = {
    title: `Vulnerability severity levels of image ${data.name} `,
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true,
      },
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
    },
    height: '400px',
  };
  const chartData = Object.entries(data)
    .filter(([key]) => key !== 'name')
    .reduce((acc, [typeKey, typeValue]) => {
      const val = Object.entries(typeValue).reduce(
        (levelAcc, [levelKey, levelValue]) => {
          return [
            ...levelAcc,
            {
              key: `${typeKey}`,
              group: `${levelKey}`,
              value: levelValue,
            },
          ];
        },
        []
      );
      return [...acc, ...val];
    }, []);
  return (
    <Modal
      open={opened}
      onBlurCapture={handleChartClose}
      primaryButtonText={'OK'}
      secondaryButtonText={'Close'}
      onRequestClose={handleChartClose}
      onRequestSubmit={handleChartClose}
    >
      <Chart data={chartData} options={options} />
    </Modal>
  );
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [show, setShow] = useState(false);
  const [blur, setBlur] = useState(true);

  const [action, setAction] = useState({
    type: null,
    selected: [],
  });

  const [chart, setChart] = useState({
    opened: false,
    data: {},
  });

  const fetchAPI = async (api) => {
    try {
      const response = await fetch(api);
      const result = await response.json();
      setData(getImages(result));
    } catch (e) {
      setData({ error: e });
    }
  };
  const processAction = async () => {
    const response = await axios.post(
      'http://192.168.99.100:8000/scan/' + action.type,
      action.selected.map(({ cells = Array }) => {
        let row = {};
        cells.forEach((cell) => {
          const rowName = cell['id'].split(':')[1];
          const rowValue = cell?.value || null;
          row = { ...row, [rowName]: rowValue };
        });
        return row;
      })
    );
    const images = await response.data;
    alert(images);
  };

  useEffect(() => {
    const fAPI = fetchAPI('http://192.168.99.100:8000/');
    setInterval(() => fAPI, 5000);
    return () => clearInterval(() => fAPI);
  }, []);
  useEffect(() => {
    setHeaders(initialHeaders);
  }, [data]);

  const handleSubmit = () => {
    setBlur(false);
    processAction();
    setShow(false);
    setBlur(true);
  };

  const handleReject = () => (blur ? setShow(false) : null);
  const triggerFunction = (type = String, selected = Array) => {
    setShow(true);
    setAction({ type: type, selected: selected });
  };
  const handleClose = () => {
    return new Promise((resolve, reject) => {
      if (blur) resolve(setShow(false));
    });
  };

  const handleChartOpen = (item) => {
    const [firstItem] = item.cells;
    const { value } = firstItem;
    const found = data.find((item) => item.name === value);

    setChart({
      opened: true,
      data: {
        name: found.name,
        oss: found.oss,
        va: found.va,
        static: found.static,
      },
    });
  };
  const handleChartClose = () => {
    setChart({
      opened: false,
      data: {},
    });
  };

  return (
    <div>
      {show && (
        <Modal
          open={show}
          onRequestClose={handleReject}
          onSecondarySubmit={handleReject}
          onRequestSubmit={handleSubmit}
          primaryButtonText="Confirm"
          secondaryButtonText="Cancel"
          onBlurCapture={() => setTimeout(handleClose, 200)}
        >
          <ModalHeader title="Confirm action" />
          <ModalBody>
            Are you sure to trigger {action.type} scan?
            <ul>
              {action.selected.map((item, key) => (
                <li key={key}>{item.name}</li>
              ))}
            </ul>
          </ModalBody>
        </Modal>
      )}
      {chart.opened && (
        <ChartModal
          data={chart.data}
          handleChartClose={handleChartClose}
          opened={chart.opened}
        />
      )}
      {data !== [] && (
        <DataTable
          isSortable
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
            <TableContainer title="Security scans review">
              <TableToolbar>
                <TableBatchActions {...getBatchActionProps()}>
                  <TableBatchAction
                    tabIndex={
                      getBatchActionProps().shouldShowBatchActions ? 0 : -1
                    }
                    renderIcon={RunIcon}
                    onClick={() => triggerFunction('oss', selectedRows)}
                  >
                    OSS
                  </TableBatchAction>
                  <TableBatchAction
                    tabIndex={
                      getBatchActionProps().shouldShowBatchActions ? 0 : -1
                    }
                    renderIcon={RunIcon}
                    onClick={() => triggerFunction('va', selectedRows)}
                  >
                    VA
                  </TableBatchAction>
                  <TableBatchAction
                    tabIndex={
                      getBatchActionProps().shouldShowBatchActions ? 0 : -1
                    }
                    renderIcon={RunIcon}
                    onClick={() => triggerFunction('static', selectedRows)}
                  >
                    Static
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
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowKey) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        <TableSelectRow {...getSelectionProps({ row })} />
                        {row.cells.map((cell) => {
                          const isLevel = () =>
                            ['oss', 'va', 'static'].find(
                              (item) => item === cell.id.slice(2)
                            );
                          if (isLevel()) {
                            const obj = cell.value;
                            if (obj) {
                              let currentLevel = '';
                              if (obj.high > 0) currentLevel = 'high';
                              else if (obj.medium > 0) currentLevel = 'medium';
                              else if (obj.low > 0) currentLevel = 'low';
                              else currentLevel = 'basic';
                              return (
                                <TableCell
                                  key={cell.id}
                                  onClick={
                                    currentLevel !== 'basic'
                                      ? () => handleChartOpen(row)
                                      : null
                                  }
                                >
                                  <Level
                                    level={currentLevel}
                                    style={
                                      currentLevel !== 'basic'
                                        ? { cursor: 'pointer' }
                                        : null
                                    }
                                  />
                                </TableCell>
                              );
                            }
                          }
                          return (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          );
                        })}
                      </TableExpandRow>
                      {row.isExpanded && data[rowKey].scanLinks.length > 0 && (
                        <TableExpandedRow colSpan={headers.length + 2}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'flex-start',
                            }}
                          >
                            {Object.entries(data[rowKey].results).map(
                              ([resultKey, resultValue], actionKey) => {
                                return (
                                  <div
                                    key={resultKey + rowKey}
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                      justifyContent: 'flex-start',
                                      marginRight: 30,
                                    }}
                                  >
                                    <p style={{ marginBottom: 10 }}>
                                      {resultKey}
                                    </p>
                                    {Object.entries(
                                      data[rowKey].scanLinks[actionKey][
                                        resultKey
                                      ]
                                    ).map(([linkKey, linkValue]) => (
                                      <Link
                                        href={linkValue}
                                        target="_blank"
                                        key={linkKey}
                                      >
                                        {linkKey}
                                      </Link>
                                    ))}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </TableExpandedRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
      )}
    </div>
  );
}

export default Dashboard;
