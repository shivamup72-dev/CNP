import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";
import API from "../../api/endpoint";
import { formatDate } from "../../utils/DateUtility";
import { capitalizeWords } from "../../utils/Utility";
import { FaCheck } from "react-icons/fa";
import { showSuccessToast, showErrorToast } from "../../components/common/Toast.jsx";
import VoterCardDetailsModal from "../modals/VoterCardDetailsModal";
import BootstrapButton from "../../components/common/BootstrapButton";

const VoterCardTable = () => {
  const [voterCards, setVoterCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [selectedVoterCard, setSelectedVoterCard] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchVoterCards = async () => {
      try {
        const response = await API.get(`${API.ENDPOINTS.VOTER_CARDS}/?paginate=1`);
        console.log("Voter Card API Response:", response);
        setVoterCards(response.results);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch voter card requests");
        setLoading(false);
      }
    };

    fetchVoterCards();
  }, []);

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      
      // Create FormData object
      const formData = new FormData();
      formData.append('approval_status', 'approved');
      
      // Send PUT request to approve the voter card using FormData
      const response = await API.put(API.ENDPOINTS.VOTER_CARD_APPROVE(id), formData);
      
      if (response) {
        showSuccessToast("Voter card request approved successfully");
        
        // Refresh the voter cards list
        const updatedResponse = await API.get(`${API.ENDPOINTS.VOTER_CARDS}/?paginate=1`);
        setVoterCards(updatedResponse.results);
      }
    } catch (err) {
      console.error("Error approving voter card:", err);
      showErrorToast("Failed to approve voter card request");
    } finally {
      setApprovingId(null);
    }
  };

  // Table cell styles for consistency with PostTable
  const tableCellStyle = {
    verticalAlign: "middle",
    borderRight: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem 0.5rem",
    fontSize: "0.75rem"
  };

  const lastCellStyle = {
    verticalAlign: "middle",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem",
    fontSize: "0.75rem"
  };

  // Add header style for smaller font
  const headerStyle = {
    ...tableCellStyle,
    fontSize: "0.75rem",
    fontWeight: "600"
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger py-4">
        {error}
      </div>
    );
  }

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
              <th style={{ ...tableCellStyle, width: "5%" }}>Sr. No.</th>
              <th style={{ ...tableCellStyle, width: "20%" }}>Voter Name</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>State</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>City</th>
              <th style={{ ...tableCellStyle, width: "15%" }}>Request Date</th>
              <th style={{ ...tableCellStyle, width: "10%" }}>Status</th>
              <th style={{ ...lastCellStyle, width: "7%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-danger">
                  <div className="alert alert-danger mb-0">
                    {error}
                  </div>
                </td>
              </tr>
            ) : voterCards.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No requests available</td>
              </tr>
            ) : (
              voterCards.map((card, index) => (
                <tr key={card.id}>
                  <td style={tableCellStyle}>{index + 1}</td>
                  <td style={tableCellStyle}>
                    <div 
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setSelectedVoterCard(card);
                        setShowDetailsModal(true);
                      }}
                    >
                      {card.full_name ? capitalizeWords(card.full_name) : 'N/A'}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontSize: "0.75rem"
                    }}>
                      {card.state?.name || 'N/A'}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontSize: "0.75rem"
                    }}>
                      {card.city?.profile_id || 'N/A'}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontSize: "0.75rem"
                    }}>
                      {card.date_created ? formatDate(card.date_created) : 'N/A'}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <Badge 
                      bg={card.approval_status === 'pending' ? 'warning' : 'success'}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {card.approval_status ? card.approval_status.charAt(0).toUpperCase() + card.approval_status.slice(1) : 'N/A'}
                    </Badge>
                  </td>
                  <td style={lastCellStyle}>
                    <div className="d-flex justify-content-center">
                      {card.approval_status === 'pending' ? (
                        <BootstrapButton
                          variant="light"
                          size="sm"
                          className="p-0"
                          style={{ width: "28px", height: "28px" }}
                          onClick={() => handleApprove(card.id)}
                          disabled={approvingId === card.id}
                          title="Approve Voter Card"
                        >
                          {approvingId === card.id ? (
                            "..."
                          ) : (
                            <FaCheck style={{ color: "#6c757d", fontSize: "0.8rem" }} />
                          )}
                        </BootstrapButton>
                      ) : (
                        <BootstrapButton
                          variant="light"
                          size="sm"
                          className="p-0"
                          style={{ width: "28px", height: "28px" }}
                          disabled
                        >
                          <FaCheck style={{ color: "var(--bs-success)", fontSize: "0.8rem" }} />
                        </BootstrapButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <VoterCardDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        voterCard={selectedVoterCard}
      />
    </div>
  );
};

export default VoterCardTable; 