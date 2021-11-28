import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import moment from 'moment';
// material
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Grid,
  TextField,
  MenuItem,
  Box,
  Button
} from '@material-ui/core';
import { DesktopDateRangePicker, LocalizationProvider } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { ExportCSV } from '../components/exportToExcel';
import firebase from '../firebase';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar } from '../components/_dashboard/user';
import { clientDataGet, itemRateDataGet, jobDataGet } from '../utils/cache';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'client', label: 'Client', alignRight: false },
  { id: 'itemNumber', label: 'Item Number', alignRight: false },
  { id: 'rate', label: 'Rate', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'hours', label: 'Hours', alignRight: false },
  { id: 'planManager', label: 'Plan Manager', alignRight: false },
  { id: 'tax', label: 'Tax (Free)', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query, arrayClient) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_ndis) => {
      const _filtered = arrayClient.filter((client) => client.id === _ndis.customer)[0]?.name;
      return _filtered.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Ndis() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [ndis, setNdis] = useState([]);
  const [itemRate, setItemRate] = useState(itemRateDataGet() || []);
  const [clients, setClients] = useState(clientDataGet() || []);
  const [orderBy, setOrderBy] = useState('itemNumber');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [allocated, setAllocated] = useState();
  const [filterGrid, setFilterGrid] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    firebase
      .firestore()
      .collection('jobs')
      .onSnapshot((snapshot) => {
        const newNdis = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setNdis(newNdis);
      });
    firebase
      .firestore()
      .collection('clients')
      .onSnapshot((snapshot) => {
        const newClient = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(newClient);
      });
    firebase
      .firestore()
      .collection('itemrate')
      .onSnapshot((snapshot) => {
        const newItemRate = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setItemRate(newItemRate);
      });
  }, []);

  const clearFilter = () => {
    setAllocated();
    setDateRange([null, null]);
    const jobsData = jobDataGet();
    setNdis(jobsData);
  };

  const filterDataByInput = () => {
    let filteredData;
    const jobsData = jobDataGet();
    filteredData = jobsData.filter((job) => job.item === allocated);

    if (dateRange[0] !== null && allocated !== null) {
      filteredData = filteredData.filter(
        (job) =>
          new Date(job.bookingDate) > new Date(dateRange[0]) &&
          new Date(job.bookingDate) < new Date(dateRange[1])
      );
    } else if (dateRange[0] !== null) {
      filteredData = jobsData.filter(
        (job) =>
          new Date(job.bookingDate) > new Date(dateRange[0]) &&
          new Date(job.bookingDate) < new Date(dateRange[1])
      );
    }
    setNdis(filteredData);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = ndis?.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - ndis?.length) : 0;

  const filteredNdis = applySortFilter(ndis, getComparator(order, orderBy), filterName, clients);

  const exportExcel = filteredNdis.map((data) => ({
    Client: clients.filter((client) => client.id === data.customer)[0]?.name,
    Item_Number: itemRate.filter((items) => items.id === data.item)[0]?.name,
    Item_Rate: itemRate.filter((items) => items.id === data.item)[0]?.rate,
    Amount: data.price,
    Date: moment(data.bookingDate).format('DD-MM-YYYY hh:mm a'),
    Hour: data.hour,
    Plan_Manager:
      clients.filter((client) => client.id === data.customer)[0]?.planManagementDetail === 1
        ? 'Plan Management'
        : 'Ndis Management',
    Tax: 0
  }));

  const isUserNotFound = filteredNdis.length === 0;

  return (
    <Page title="Client | Minimal-UI">
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Ndis
          </Typography>
          <ExportCSV
            csvData={exportExcel}
            fileName={`report_${moment(new Date()).format('DD/MM/YYYY hh:mm a')}`}
          />
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            filterListClick={() => setFilterGrid(!filterGrid)}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              {filterGrid && (
                <Grid container style={{ padding: 15 }} spacing={3}>
                  <Grid item md={3}>
                    <TextField
                      select
                      style={{ marginBottom: 15, textAlign: 'left' }}
                      fullWidth
                      size="small"
                      onChange={(e) => setAllocated(e.target.value)}
                      value={allocated}
                      id="allocated"
                      label="Item Rate"
                    >
                      {itemRate.map((allocated) => (
                        <MenuItem key={allocated.name} value={allocated.id}>
                          {allocated.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DesktopDateRangePicker
                        startText="Start"
                        value={dateRange}
                        onChange={(newValue) => {
                          setDateRange(newValue);
                        }}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(startProps, endProps) => (
                          <>
                            <TextField size="small" {...startProps} />
                            <Box sx={{ mx: 2 }}> to </Box>
                            <TextField size="small" {...endProps} />
                          </>
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item md={1}>
                    <Button onClick={filterDataByInput} variant="contained">
                      Filter
                    </Button>
                  </Grid>
                  <Grid item md={2}>
                    <Button color="inherit" onClick={clearFilter} variant="contained">
                      Clear Filter
                    </Button>
                  </Grid>
                </Grid>
              )}
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={ndis.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredNdis
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, bookingDate, hour, item, price, customer } = row;
                      const isItemSelected = selected.indexOf(customer) !== -1;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox" />
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {clients.filter((client) => client.id === customer)[0]?.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            {itemRate.filter((items) => items.id === item)[0]?.name}
                          </TableCell>
                          <TableCell align="left">
                            {itemRate.filter((items) => items.id === item)[0]?.rate}
                          </TableCell>
                          <TableCell align="left">{price}</TableCell>
                          <TableCell align="left">
                            {moment(bookingDate).format('DD-MM-YYYY hh:mm a')}
                          </TableCell>
                          <TableCell align="left">{hour}h</TableCell>
                          <TableCell align="left">
                            {clients.filter((client) => client.id === customer)[0]
                              ?.planManagementDetail === 1 && 'Plan Management'}
                            {clients.filter((client) => client.id === customer)[0]
                              ?.planManagementDetail === 0 && 'Ndis Management'}
                          </TableCell>
                          <TableCell align="left">0</TableCell>
                          {/* <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={(status === 'banned' && 'error') || 'success'}
                            >
                              {sentenceCase(status)}
                            </Label>
                          </TableCell> */}

                          {/* <TableCell align="right">
                            <UserMoreMenu linkEdit={`/dashboard/client-manage?act=Edit&id=${id}`} />
                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={ndis.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
