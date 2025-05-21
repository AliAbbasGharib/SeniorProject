import React, { useEffect, useState } from "react";
import { Axios } from "../../../API/Axios";
import { REQUESTBLOOD } from "../../../API/Api";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Chip,
  Divider,
  ListSubheader
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function GetRequestBlood() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);

  const filteredRequests = requests.filter((req) => {
    const patient = (req.patient_name || "").toLowerCase();
    const blood = (req.blood_type || "").toLowerCase();
    const hospital = (req.hospital_name || "").toLowerCase();
    const term = search.toLowerCase();
    return patient.includes(term) || blood.includes(term) || hospital.includes(term);
  });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Axios.get(REQUESTBLOOD);
        const data = response.data?.requests || [];
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Error fetching blood requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleView = (req) => {
    alert(`Viewing request for ${req.patient_name}`);
  };

  const handleUpdate = (req) => {
    alert(`Updating request for ${req.patient_name}`);
  };

  async function handleDelete(request) {
    try {
      await Axios.delete(`${REQUESTBLOOD}/${request._id}`);
      setRequests((prev) => prev.filter((req) => req._id !== request._id));
      setConfirmRequest(null);
    } catch (err) {
      alert("Failed to delete request.");
    }
  }

  const handleChangeStatus = async (req, newStatus) => {
    try {
      await Axios.put(`${REQUESTBLOOD}/status/${req._id}`, { done_status: newStatus });
      setRequests(prev =>
        prev.map(r => (r._id === req._id ? { ...r, done_status: newStatus } : r))
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleMenuOpen = (event, req) => {
    setAnchorEl(event.currentTarget);
    setSelectedReq(req);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReq(null);
  };

  const getStatusChip = (status) => {
    return status === "complete"
      ? <Chip label="Complete" color="success" variant="filled" />
      : <Chip label="Non Complete" color="warning" variant="filled" />;
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Blood Requests
      </Typography>

      <TextField
        label="Search by patient, blood type, or hospital"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, width: 350, maxWidth: "100%" }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Blood Type</TableCell>
                <TableCell>Units Needed</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No requests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req, index) => (
                  <TableRow
                    key={req._id || index}
                    hover
                    sx={req.done_status === "complete" ? { backgroundColor: "#e8f5e9" } : {}}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{req.patient_name}</TableCell>
                    <TableCell>
                      <Chip label={req.blood_type} color="error" />
                    </TableCell>
                    <TableCell>{req.quantity}</TableCell>
                    <TableCell>{req.contact_number}</TableCell>
                    <TableCell>{req.hospital_name}</TableCell>
                    <TableCell>{req.request_date?.slice(0, 10)}</TableCell>
                    <TableCell>{getStatusChip(req.done_status)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, req)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => { handleView(selectedReq); handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View
        </MenuItem>
        <MenuItem onClick={() => { handleUpdate(selectedReq); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmRequest(selectedReq);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
        <Divider />
        <ListSubheader>Change Status</ListSubheader>
        {["non complete", "complete"].map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              handleChangeStatus(selectedReq, status);
              handleMenuClose();
            }}
          >
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmRequest}
        onClose={() => setConfirmRequest(null)}
      >
        <DialogTitle>Delete Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the request for{" "}
            <strong>{confirmRequest?.patient_name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRequest(null)} variant="outlined">
            No
          </Button>
          <Button
            onClick={() => handleDelete(confirmRequest)}
            color="error"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GetRequestBlood;
