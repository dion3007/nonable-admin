import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  MenuItem,
  TextField,
  Grid,
  Box,
  Switch,
  TableContainer,
  TablePagination
} from '@material-ui/core';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import DesktopDateRangePicker from '@material-ui/lab/DesktopDateRangePicker';
import firebase from '../firebase';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import {
  jobDataSet,
  driverDataSet,
  clientDataSet,
  jobDataGet,
  variableDataSet
} from '../utils/cache';
import {
  AppNewUsers,
  AppItemOrders,
  AppWeeklySales,
  AppWeeklyProfit
} from '../components/_dashboard/app';
import ModalComponents from '../components/ModalComponents';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'customerName', label: 'Customer Name', alignRight: false },
  { id: 'pickUp', label: 'From', alignRight: false },
  { id: 'dropOff', label: 'Destination', alignRight: false },
  { id: 'price', label: 'Amount', alignRight: false },
  { id: 'driverPaid', label: 'Paid Driver', alignRight: false },
  { id: 'driver', label: 'Driver', alignRight: false },
  { id: 'paid', label: 'Paid Status', alignRight: false },
  { id: 'date', label: 'Booking Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

const allocateArr = [
  {
    name: 'All',
    value: 0
  },
  {
    name: 'Allocated',
    value: 1
  },
  {
    name: 'Un-Allocated',
    value: 2
  }
];

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

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_job) => _job.customer.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Job() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobsTemp, setJobsTemp] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [variable, setVariable] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [uid, setUid] = useState('');
  const [openPaidModal, setOpenPaidModal] = useState(false);
  const [paidUid, setPaidUid] = useState('');

  const [filterGrid, setFilterGrid] = useState(false);
  const [allocated, setAllocated] = useState();
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    firebase
      .firestore()
      .collection('jobs')
      .onSnapshot((snapshot) => {
        const newJob = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(newJob);
      });
    firebase
      .firestore()
      .collection('jobs')
      .onSnapshot((snapshot) => {
        const newJob = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobsTemp(newJob);
      });
    firebase
      .firestore()
      .collection('drivers')
      .onSnapshot((snapshot) => {
        const newDriver = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setDrivers(newDriver);
      });
    firebase
      .firestore()
      .collection('variable')
      .onSnapshot((snapshot) => {
        const newVar = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setVariable(newVar);
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
  }, []);

  if (jobs) {
    jobDataSet(jobsTemp);
  }

  if (variable) {
    variableDataSet(variable);
  }

  const clearFilter = () => {
    setAllocated();
    setDateRange([null, null]);
    const jobsData = jobDataGet();
    setJobs(jobsData);
  };

  const filterDataByInput = () => {
    let filteredData;
    const jobsData = jobDataGet();
    if (allocated === 1) {
      filteredData = jobsData.filter((job) => job.driver !== '');
    } else if (allocated === 2) {
      filteredData = jobsData.filter((job) => job.driver === '');
    } else {
      filteredData = jobsData;
    }

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
    console.log(filteredData, dateRange);
    setJobs(filteredData);
  };

  const deleteJobsEach = (id) => {
    setUid(id);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const deleteJobs = () => {
    firebase.firestore().collection('jobs').doc(uid).delete();
    setOpenModal(false);
  };

  const paidJobEach = (id) => {
    setPaidUid(id);
    setOpenPaidModal(true);
  };

  const handleModalPaidClose = () => {
    setOpenPaidModal(false);
  };

  const paidJob = () => {
    const jobs = jobDataGet();
    const filteredSetJobs = jobs.filter((job) => job.id === paidUid)[0];
    firebase.firestore().collection('jobs').doc(filteredSetJobs.id).set({
      customer: filteredSetJobs?.customer,
      driver: filteredSetJobs?.driver,
      notes: filteredSetJobs?.notes,
      pickUp: filteredSetJobs?.pickUp,
      price: filteredSetJobs?.price,
      profit: filteredSetJobs?.profit,
      driverPaid: filteredSetJobs?.driverPaid,
      bookingDate: filteredSetJobs?.bookingDate.toString(),
      dropOff: filteredSetJobs?.dropOff,
      expensePrice: 0,
      expenseReason: 'none',
      hour: filteredSetJobs?.hour,
      distance: filteredSetJobs?.distance,
      date: new Date(),
      duplicate: false,
      paid: !filteredSetJobs?.paid,
      jobStat: 0
    });
    setOpenPaidModal(false);
  };

  const addToLocalStorage = () => {
    clientDataSet(clients);
    driverDataSet(drivers);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = jobs?.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobs?.length) : 0;

  const filteredJobs = applySortFilter(jobs, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredJobs.length === 0;

  // amount

  const countList = filteredJobs.reduce((p, c) => {
    p[c.driver] = (p[c.driver] || 0) + 1;
    return p;
  }, {});

  const dateList = filteredJobs.reduce((p, c) => {
    p[c.bookingDate] = (p[c.bookingDate] || 0) + 1;
    return p;
  }, {});

  const checkIfDuplicate = filteredJobs.filter(
    (obj) => countList[obj.driver] > 1 && dateList[obj.bookingDate] > 1
  );

  const sumAmount = filteredJobs.reduce((a, { price }) => parseFloat(a) + parseFloat(price), 0);
  const sumHours = filteredJobs.reduce((a, { hour }) => parseFloat(a) + parseFloat(hour), 0);
  const sumDistance = filteredJobs.reduce(
    (a, { distance }) => parseFloat(a) + parseFloat(distance),
    0
  );
  const sumPaidDriver = filteredJobs.reduce(
    (a, { driverPaid }) => parseFloat(a) + parseFloat(driverPaid),
    0
  );

  return (
    <Page title="Bookings | Minimal-UI">
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Booking
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            onClick={addToLocalStorage}
            to="/dashboard/booking-manage?act=Add"
            startIcon={<Icon icon={plusFill} />}
          >
            New Booking
          </Button>
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
                      label="Category"
                    >
                      {allocateArr.map((allocated) => (
                        <MenuItem key={allocated.value} value={allocated.value}>
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
                  rowCount={jobs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const {
                        id,
                        customer,
                        pickUp,
                        dropOff,
                        price,
                        driverPaid,
                        paid,
                        bookingDate,
                        driver
                      } = row;
                      const isItemSelected = selected.indexOf(customer) !== -1;

                      return (
                        <TableRow
                          hover
                          style={
                            checkIfDuplicate.some((el) => el.id === id)
                              ? { backgroundColor: '#bdbdbd' }
                              : { backgroundColor: '#fff' }
                          }
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
                                {clients?.filter((client) => client.id === customer)[0]?.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{pickUp}</TableCell>
                          <TableCell align="left">{dropOff}</TableCell>
                          <TableCell align="left" width="100px">
                            $ {price}
                          </TableCell>
                          <TableCell align="left" width="100px">
                            $ {driverPaid}
                          </TableCell>
                          <TableCell align="left">
                            {drivers?.filter((driverData) => driverData.id === driver)[0]?.name}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={paid}
                              onChange={() => paidJobEach(id)}
                              inputProps={{ 'aria-label': 'controlled' }}
                            />
                          </TableCell>
                          <TableCell align="left" width="150px">
                            {moment(bookingDate).format('DD-MM-YYYY')}
                          </TableCell>
                          <TableCell align="left" width="100px">
                            {moment(bookingDate).format('hh:mm A')}
                          </TableCell>
                          <TableCell align="right">
                            <UserMoreMenu
                              deleteFunction={() => deleteJobsEach(id)}
                              linkEdit={`/dashboard/booking-manage?act=Edit&id=${id}`}
                            />
                          </TableCell>
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
            <ModalComponents
              title="Delete"
              message="Are you sure you wish to delete this job?"
              open={openModal}
              handleSubmit={deleteJobs}
              handleClose={handleModalClose}
            />
            <ModalComponents
              title="Paid"
              message="Mark as Paid / Unpaid?"
              open={openPaidModal}
              handleSubmit={paidJob}
              handleClose={handleModalPaidClose}
            />
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={jobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <Container style={{ marginTop: 20 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWeeklySales total={sumAmount} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppNewUsers total={sumHours} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppItemOrders total={sumDistance} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWeeklyProfit total={sumPaidDriver} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
