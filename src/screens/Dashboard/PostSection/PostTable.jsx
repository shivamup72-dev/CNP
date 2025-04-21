import React from "react";
import { Table, Spinner } from "react-bootstrap";
import { FaCheck, FaShareSquare, FaFlag } from "react-icons/fa";
import { FiTrash, FiFlag } from "react-icons/fi";
import Button from "../../../components/common/BootstrapButton";
import { formatDate } from "../../../utils/DateUtility";

const PostTable = ({
    currentPage,
    getCurrentFilteredPosts,
    setSelectedPost,
    setShowPostDetailModal,
    getUserAvatar,
    handleApprovePost,
    handleFlagButtonClick,
    handleRepost,
    setShowDeleteModal,
    approvingPostId,
    flaggingPostId,
    repostingPostId,
    error = null,
    isSearching = false,
    activeFilter = "all"
}) => {
    // Add logging for debugging
    console.log(`[PostTable] Rendering with activeFilter: ${activeFilter}`);
    console.log(`[PostTable] Posts count:`, getCurrentFilteredPosts().length);
    if (activeFilter === "flagged") {
        console.log(`[PostTable] Flagged posts in table:`, 
            getCurrentFilteredPosts().filter(post => post.flagged || post.post_status === "flagged"));
    }
    if (activeFilter === "deleted") {
        console.log(`[PostTable] Deleted posts in table:`, 
            getCurrentFilteredPosts().filter(post => post.isDeleted || post.post_status === "rejected"));
    }
    
    // Common table cell style for consistency
    const tableCellStyle = {
        verticalAlign: "middle",
        borderRight: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        padding: "0.4rem 0.5rem"
    };

    const lastCellStyle = {
        verticalAlign: "middle",
        borderBottom: "1px solid #e0e0e0",
        padding: "0.4rem"
    };

    return (
        <div className="table-responsive">
            {isSearching && (
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 1000,
                    background: "rgba(255,255,255,0.9)",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "12px"
                }}>
                    <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                    <span>Searching...</span>
                </div>
            )}
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
                            <th style={{ ...tableCellStyle, width: "5%" }}>S.No.</th>
                            <th style={{ ...tableCellStyle, width: "20%" }}>Content</th>
                            <th style={{ ...tableCellStyle, width: "10%" }}>Media</th>
                            <th style={{ ...tableCellStyle, width: "15%" }}>Author</th>
                            <th style={{ ...tableCellStyle, width: "12%" }}>Date</th>
                            <th style={{ ...tableCellStyle, width: "8%" }}>Status</th>
                            <th style={{ ...lastCellStyle, width: "10%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-danger">
                                    <div className="alert alert-danger mb-0">
                                        {error}
                                    </div>
                                </td>
                            </tr>
                        ) : getCurrentFilteredPosts().length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">No posts available</td>
                            </tr>
                        ) : (
                            getCurrentFilteredPosts().map((post, index) => (
                                <tr key={post.id}>
                                    <td style={tableCellStyle}>{(currentPage - 1) * 10 + index + 1}</td>
                                    <td
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setShowPostDetailModal(true);
                                        }}
                                        style={{ ...tableCellStyle, cursor: "pointer" }}
                                    >
                                        <div style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "100%"
                                        }}>
                                            {post.title || "No content"}
                                        </div>
                                    </td>
                                    <td
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setShowPostDetailModal(true);
                                        }}
                                        style={{ ...tableCellStyle, cursor: "pointer" }}
                                    >
                                        {post.image ? (
                                            <img
                                                src={post.image}
                                                alt="Post media"
                                                style={{ height: "50px", width: "80px", objectFit: "cover" }}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/80x50?text=No+Image";
                                                }}
                                            />
                                        ) : (
                                            <span className="text-muted">No media</span>
                                        )}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rounded-circle overflow-hidden flex-shrink-0"
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    minWidth: "32px",
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundImage: getUserAvatar(post) ? `url(${getUserAvatar(post)})` : "none",
                                                    backgroundColor: getUserAvatar(post) ? "transparent" : "#e9ecef",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "1px solid #dee2e6",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                    marginRight: "8px"
                                                }}
                                            >
                                                {!getUserAvatar(post) && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6c757d" className="bi bi-person" viewBox="0 0 16 16" style={{ display: "block" }}>
                                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "calc(100% - 40px)"
                                            }}>
                                                {post.author || "Unknown"}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>{formatDate(post.date)}</td>
                                    <td style={tableCellStyle}>
                                        <div className="d-flex justify-content-start">
                                            {post.post_status === "approved" ? (
                                                <span className="badge bg-success">Approved</span>
                                            ) : post.post_status === "flagged" || post.flagged ? (
                                                <span className="badge" style={{ backgroundColor: "#fd7e14" }}>Flagged</span>
                                            ) : post.post_status === "rejected" || post.isDeleted ? (
                                                <span className="badge bg-danger">Deleted</span>
                                            ) : (
                                                <span className={`badge ${post.ageColor}`}>{post.age}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={lastCellStyle}>
                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="d-flex justify-content-center align-items-center"
                                                style={{ width: "32px", height: "32px", padding: "0" }}
                                                onClick={() => handleApprovePost(post.id)}
                                                disabled={approvingPostId === post.id || post.post_status === "approved"}
                                            >
                                                {approvingPostId === post.id ? (
                                                    <span>...</span>
                                                ) : (
                                                    <FaCheck style={{
                                                        color: post.post_status === "approved" ? "var(--bs-success)" : "#6c757d"
                                                    }} />
                                                )}
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="d-flex justify-content-center align-items-center"
                                                style={{ 
                                                    width: "32px", 
                                                    height: "32px", 
                                                    padding: "0",
                                                    opacity: post.post_status !== "approved" ? "0.5" : "1",
                                                    border: "none",
                                                    boxShadow: "none"
                                                }}
                                                onClick={() => {
                                                    handleRepost(post.id);
                                                    // Mark as reposted immediately for visual feedback
                                                    post.isReposted = true;
                                                }}
                                                disabled={repostingPostId === post.id || post.post_status !== "approved"}
                                                title={post.isReposted ? "Repost Again" : "Repost"}
                                            >
                                                {repostingPostId === post.id ? (
                                                    <span>...</span>
                                                ) : (
                                                    <FaShareSquare style={{
                                                        color: post.post_status !== "approved" ? "#adb5bd" : 
                                                               post.isReposted ? "var(--bs-success)" : "#0d6efd"
                                                    }} />
                                                )}
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="d-flex justify-content-center align-items-center"
                                                style={{ width: "32px", height: "32px", padding: "0" }}
                                                onClick={() => handleFlagButtonClick(post)}
                                                disabled={flaggingPostId === post.id}
                                            >
                                                {flaggingPostId === post.id ? (
                                                    <span>...</span>
                                                ) : post.flagged ? (
                                                    <FaFlag
                                                        style={{
                                                            color: "#fd7e14"
                                                        }}
                                                    />
                                                ) : (
                                                    <FiFlag
                                                        style={{
                                                            color: "#6c757d"
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="d-flex justify-content-center align-items-center"
                                                style={{ width: "32px", height: "32px", padding: "0" }}
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <FiTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default PostTable; 