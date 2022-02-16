import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar } from '../components/_dashboard/user';
import { jobDataSet, jobDataGet } from '../utils/cache';
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
  { id: 'driver', label: 'Driver', alignRight: false },
  { id: 'paid', label: 'Paid Status', alignRight: false },
  { id: 'date', label: 'Booking Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
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

function applySortFilter(array, comparator, query, arrayClient) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_job) => {
      const _filtered = arrayClient.filter((client) => client.id === _job.customer)[0]?.name;
      return _filtered.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function JobDetail({ idParams }) {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [jobs, setJobs] = useState([]);
  const [jobsTemp, setJobsTemp] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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

  const filteredJobs = applySortFilter(jobs, getComparator(order, orderBy), filterName, clients);

  const isUserNotFound = filteredJobs.length === 0;

  // amount

  const filterByIdParams = filteredJobs.filter(
    (filJob) => filJob.customer === idParams || filJob.driver === idParams
  );

  const sumAmount = filterByIdParams.reduce((a, { price }) => parseFloat(a) + parseFloat(price), 0);
  const sumHours = filterByIdParams.reduce((a, { hour }) => parseFloat(a) + parseFloat(hour), 0);
  const sumDistance = filterByIdParams.reduce(
    (a, { distance }) => parseFloat(a) + parseFloat(distance),
    0
  );
  const sumPaidDriver = filterByIdParams.reduce(
    (a, { driverPaid }) => parseFloat(a) + parseFloat(driverPaid),
    0
  );

  return (
    <>
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={5}>
          <Typography variant="h4" gutterBottom>
            List Booking
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
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
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filterByIdParams
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, customer, pickUp, dropOff, price, paid, bookingDate, driver } =
                        row;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox">
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
                          <TableCell align="left">$ {price}</TableCell>
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
                          <TableCell align="left">
                            {moment(bookingDate).format('DD-MM-YYYY')}
                          </TableCell>
                          <TableCell align="left">
                            {moment(bookingDate).format('hh:mm A')}
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
            count={filterByIdParams.length}
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
    </>
  );
}

JobDetail.propTypes = {
  idParams: PropTypes.string
};
