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
import Label from '../components/Label';
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
  variableDataSet,
  itemRateDataSet
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
  { id: 'customer', label: 'Customer Name', alignRight: false },
  { id: 'pickUp', label: 'From', alignRight: false },
  { id: 'dropOff', label: 'Destination', alignRight: false },
  { id: 'price', label: 'Amount', alignRight: false },
  { id: 'driverPaid', label: 'Paid Driver', alignRight: false },
  { id: 'driver', label: 'Driver', alignRight: false },
  { id: 'paid', label: 'Paid Status', alignRight: false },
  { id: 'date', label: 'Booking Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

const statusList = [
  {
    value: 92,
    label: 'All'
  },
  {
    value: 7,
    label: 'Un Allocated'
  },
  {
    value: 0,
    label: 'Requested'
  },
  {
    value: 1,
    label: 'Confirmed'
  },
  {
    value: 2,
    label: 'On Going'
  },
  {
    value: 3,
    label: 'Completed'
  },
  {
    value: 4,
    label: 'Need Confirm Cancel'
  },
  {
    value: 5,
    label: 'Paid'
  },
  {
    value: 6,
    label: 'Declined'
  },
  {
    value: 8,
    label: 'Need Confirm Completed'
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

function applySortFilter(array, comparator, query, arrayClient, driverSearch) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_job) => {
      let _filtered;
      if (driverSearch) {
        _filtered = arrayClient.filter((driver) => driver.id === _job.driver)[0]?.name;
      } else {
        _filtered = arrayClient.filter((client) => client.id === _job.customer)[0]?.name;
      }
      return _filtered.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
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
  const [itemRate, setItemRate] = useState([]);
  const [variable, setVariable] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState(false);
  const [uid, setUid] = useState('');
  const [openPaidModal, setOpenPaidModal] = useState(false);
  const [paidUid, setPaidUid] = useState('');

  const [filterGrid, setFilterGrid] = useState(false);
  const [allocated, setAllocated] = useState();
  const [dateRange, setDateRange] = useState([null, null]);

  const [driverSearch, setDriverSearch] = useState(false);

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
      .collection('itemrate')
      .onSnapshot((snapshot) => {
        const newItemRate = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setItemRate(newItemRate);
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

  if (clients) {
    clientDataSet(clients);
  }

  if (variable) {
    variableDataSet(variable);
  }

  if (itemRate) {
    itemRateDataSet(itemRate);
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
    if (allocated && allocated !== 92) {
      filteredData = jobsData.filter((job) => job.jobStat === allocated);
    } else if (allocated === 0) {
      filteredData = jobsData.filter((job) => job.jobStat === 0);
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

  const cancelJob = (id, status) => {
    const filteredSetJobs = jobs.filter((job) => job.id === id)[0];
    firebase
      .firestore()
      .collection('jobs')
      .doc(filteredSetJobs.id)
      .set({
        customer: filteredSetJobs?.customer,
        driver: status ? '' : filteredSetJobs?.driver,
        notes: filteredSetJobs?.notes,
        pickUp: filteredSetJobs?.pickUp,
        price: filteredSetJobs?.price,
        profit: filteredSetJobs?.profit,
        driverPaid: filteredSetJobs?.driverPaid,
        bookingDate: filteredSetJobs?.bookingDate.toString(),
        bookingTime: filteredSetJobs?.bookingTime.toString(),
        item: filteredSetJobs?.item,
        dropOff: filteredSetJobs?.dropOff,
        expensePrice: 0,
        expenseReason: 'none',
        hour: filteredSetJobs?.hour,
        distance: filteredSetJobs?.distance,
        date: new Date(),
        duplicate: false,
        paid: filteredSetJobs?.paid,
        jobStat: status ? 6 : 0
      });
    setOpenPaidModal(false);
  };

  const completedJob = (id, status) => {
    const filteredSetJobs = jobs.filter((job) => job.id === id)[0];
    firebase
      .firestore()
      .collection('jobs')
      .doc(filteredSetJobs.id)
      .set({
        customer: filteredSetJobs?.customer,
        driver: status ? filteredSetJobs?.driver : '',
        notes: filteredSetJobs?.notes,
        pickUp: filteredSetJobs?.pickUp,
        price: filteredSetJobs?.price,
        profit: filteredSetJobs?.profit,
        driverPaid: filteredSetJobs?.driverPaid,
        bookingDate: filteredSetJobs?.bookingDate.toString(),
        bookingTime: filteredSetJobs?.bookingTime.toString(),
        item: filteredSetJobs?.item,
        dropOff: filteredSetJobs?.dropOff,
        expensePrice: 0,
        expenseReason: 'none',
        hour: filteredSetJobs?.hour,
        distance: filteredSetJobs?.distance,
        date: new Date(),
        duplicate: false,
        paid: filteredSetJobs?.paid,
        jobStat: status ? 3 : 0
      });
  };

  const paidJob = () => {
    const jobs = jobDataGet();
    const filteredSetJobs = jobs.filter((job) => job.id === paidUid)[0];
    firebase
      .firestore()
      .collection('jobs')
      .doc(filteredSetJobs.id)
      .set({
        customer: filteredSetJobs?.customer,
        driver: filteredSetJobs?.driver,
        notes: filteredSetJobs?.notes,
        pickUp: filteredSetJobs?.pickUp,
        price: filteredSetJobs?.price,
        profit: filteredSetJobs?.profit,
        driverPaid: filteredSetJobs?.driverPaid,
        bookingDate: filteredSetJobs?.bookingDate.toString(),
        bookingTime: filteredSetJobs?.bookingTime.toString(),
        item: filteredSetJobs?.item,
        dropOff: filteredSetJobs?.dropOff,
        expensePrice: 0,
        expenseReason: 'none',
        hour: filteredSetJobs?.hour,
        distance: filteredSetJobs?.distance,
        date: new Date(),
        duplicate: false,
        paid: !filteredSetJobs?.paid,
        jobStat: !filteredSetJobs?.paid ? 5 : 3
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

  const filteredJobs = applySortFilter(
    jobs,
    getComparator(order, orderBy),
    filterName,
    driverSearch ? drivers : clients,
    driverSearch
  );

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
          <div style={{ marginLeft: 22, marginTop: 10 }}>
            <Grid container style={{ alignItems: 'center' }}>
              <Grid item>{driverSearch ? 'Search By Driver' : 'Search By Customer'}</Grid>
              <Grid item>
                <Switch
                  checked={driverSearch}
                  onChange={() => setDriverSearch(!driverSearch)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Grid>
            </Grid>
          </div>
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
                      {statusList.map((allocated) => (
                        <MenuItem key={allocated.value} value={allocated.value}>
                          {allocated.label}
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
                        bookingTime,
                        driver,
                        jobStat
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
                              <RouterLink
                                to={`/dashboard/booking-manage?act=Edit&id=${id}`}
                                style={{ textDecoration: 'none', color: '#000' }}
                              >
                                <Typography variant="subtitle2" noWrap>
                                  {clients?.filter((client) => client.id === customer)[0]?.name}
                                </Typography>
                              </RouterLink>
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
                            <RouterLink
                              to={`/dashboard/driver-manage?act=Edit&id=${driver}`}
                              style={{ textDecoration: 'none', color: '#000' }}
                            >
                              {drivers?.filter((driverData) => driverData.id === driver)[0]?.name}
                            </RouterLink>
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
                            {moment(bookingTime).format('hh:mm A')}
                          </TableCell>
                          <TableCell align="center" width={jobStat === 4 ? `300px` : `100px`}>
                            {jobStat === 0 && (
                              <Label variant="ghost" color="primary">
                                Requested
                              </Label>
                            )}
                            {jobStat === 1 && 'Confirmed'}
                            {jobStat === 2 && (
                              <Label variant="ghost" color="info">
                                On Going
                              </Label>
                            )}
                            {jobStat === 3 && (
                              <Label variant="ghost" color="success">
                                Completed
                              </Label>
                            )}
                            {jobStat === 4 && (
                              <Grid container justifyContent="center" spacing={2}>
                                <Grid item>
                                  <Button
                                    onClick={() => cancelJob(id, true)}
                                    variant="contained"
                                    color="error"
                                  >
                                    Confirm Cancel
                                  </Button>
                                </Grid>
                                <Grid item variant="contained">
                                  <Button onClick={() => cancelJob(id, false)}>Decline</Button>
                                </Grid>
                              </Grid>
                            )}
                            {jobStat === 5 && 'Paid'}
                            {jobStat === 6 && (
                              <Label variant="ghost" color="error">
                                Declined
                              </Label>
                            )}
                            {jobStat === 7 && 'Un Allocated'}
                            {jobStat === 8 && (
                              <Grid container justifyContent="center" spacing={2}>
                                <Grid item>
                                  <Button
                                    onClick={() => completedJob(id, true)}
                                    variant="contained"
                                    color="success"
                                  >
                                    Confirm Completed
                                  </Button>
                                </Grid>
                                <Grid item variant="contained">
                                  <Button onClick={() => completedJob(id, false)}>Decline</Button>
                                </Grid>
                              </Grid>
                            )}
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
