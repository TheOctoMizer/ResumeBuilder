// src/components/PaginationControls.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Stack,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mt={4}
    >
      <FormControl variant="outlined" size="small">
        <InputLabel id="limit-select-label">Items per page</InputLabel>
        <Select
          labelId="limit-select-label"
          value={limit}
          onChange={onLimitChange}
          label="Items per page"
          sx={{ width: "150px" }}
        >
          <MenuItem value={6}>6</MenuItem>
          <MenuItem value={12}>12</MenuItem>
          <MenuItem value={24}>24</MenuItem>
        </Select>
      </FormControl>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

export default PaginationControls;
