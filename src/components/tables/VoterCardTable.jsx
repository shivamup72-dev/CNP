import React from "react";
import { Table } from "react-bootstrap";

const VoterCardTable = () => {
  // Table cell styles for consistency with PostTable
  const tableCellStyle = {
    verticalAlign: "middle",
    borderRight: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem 0.5rem",
    fontSize: "0.85rem"
  };

  const lastCellStyle = {
    verticalAlign: "middle",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem",
    fontSize: "0.85rem"
  };

  return (
    <div className="table-responsive">
      <div style={{
        borderRadius: "5px",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        boxShadow: "none",
        position: "relative"
      }}>
        <Table hover responsive className="mb-0" style={{
          border: "none",
          margin: 0
        }}>
          <thead>
            <tr>
              <th style={{ ...tableCellStyle, width: "5%" }}>ID</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>Voter Name</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>District</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>Request Date</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>Status</th>
              <th style={{ ...lastCellStyle, width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="text-center py-4">No voter card requests available</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VoterCardTable; 