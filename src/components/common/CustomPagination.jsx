import React, { useEffect, useState } from "react";
import { Pagination } from "react-bootstrap";

/**
 * A reusable custom pagination component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items being paginated
 * @param {number} props.itemsPerPage - Number of items per page (default: 100)
 * @param {Function} props.onPageChange - Function called when page changes
 * @param {string} props.size - Size of pagination controls (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const CustomPagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 100,
    onPageChange,
    size,
    className = ""
}) => {
    // State to track window size
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Update window width state on resize
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate the actual maximum pages based on the number of items and items per page
    const actualMaxPages = Math.min(Math.ceil(totalItems / itemsPerPage), totalPages);

    // Responsive handling
    const maxVisiblePages = isMobile ? 3 : 5;

    // Get appropriate size based on screen width
    const getPaginationSize = () => {
        if (windowWidth < 576) return 'sm';
        return size || 'md';
    };

    // Common styles - more compact for mobile
    const paginationItemClass = (isActive) =>
        `${isActive ? "bg-dark border-dark" : "border border-dark"} ${isMobile ? "custom-mobile-pagination" : ""}`;

    const paginationItemStyle = (isActive) => ({
        fontWeight: isActive ? "bold" : "normal",
        padding: isMobile ? "0" : undefined,
        fontSize: isMobile ? "0.7rem" : undefined,
        minWidth: isMobile ? "24px" : undefined,
        height: isMobile ? "24px" : undefined,
        lineHeight: isMobile ? "1" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textOverflow: "ellipsis"
    });

    // Generate pagination items based on current page and total pages
    const renderPaginationItems = () => {
        const buttons = [];

        // If we have few pages, show all of them
        if (actualMaxPages <= maxVisiblePages) {
            for (let i = 1; i <= actualMaxPages; i++) {
                buttons.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => onPageChange(i)}
                        className={paginationItemClass(i === currentPage)}
                        style={paginationItemStyle(i === currentPage)}
                    >
                        {i}
                    </Pagination.Item>
                );
            }
            return buttons;
        }

        // For more pages, use a more complex layout

        // Always show first page
        buttons.push(
            <Pagination.Item
                key={1}
                active={1 === currentPage}
                onClick={() => onPageChange(1)}
                className={paginationItemClass(1 === currentPage)}
                style={paginationItemStyle(1 === currentPage)}
            >
                1
            </Pagination.Item>
        );

        // Mobile specific logic
        if (isMobile) {
            if (currentPage > 2) {
                buttons.push(
                    <Pagination.Ellipsis 
                        key="ellipsis1" 
                        disabled 
                        className="border border-dark" 
                        style={paginationItemStyle(false)}
                    />
                );
            }

            // Only show current page if it's not first or last
            if (currentPage !== 1 && currentPage !== actualMaxPages) {
                buttons.push(
                    <Pagination.Item
                        key={currentPage}
                        active={true}
                        className="bg-dark border-dark"
                        style={paginationItemStyle(true)}
                    >
                        {currentPage}
                    </Pagination.Item>
                );
            }

            if (currentPage < actualMaxPages - 1) {
                buttons.push(
                    <Pagination.Ellipsis 
                        key="ellipsis2" 
                        disabled 
                        className="border border-dark" 
                        style={paginationItemStyle(false)}
                    />
                );
            }
        } else {
            // Desktop specific logic
            if (currentPage > 3) {
                buttons.push(<Pagination.Ellipsis key="ellipsis1" disabled className="border border-dark" />);
            }

            // Pages around current page
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(actualMaxPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                // Skip first and last pages as they're handled separately
                if (i !== 1 && i !== actualMaxPages) {
                    buttons.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(i)}
                            className={paginationItemClass(i === currentPage)}
                            style={paginationItemStyle(i === currentPage)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }

            if (currentPage < actualMaxPages - 2) {
                buttons.push(<Pagination.Ellipsis key="ellipsis2" disabled className="border border-dark" />);
            }
        }

        // Always show last page if there's more than one page
        if (actualMaxPages > 1) {
            buttons.push(
                <Pagination.Item
                    key={actualMaxPages}
                    active={actualMaxPages === currentPage}
                    onClick={() => onPageChange(actualMaxPages)}
                    className={paginationItemClass(actualMaxPages === currentPage)}
                    style={paginationItemStyle(actualMaxPages === currentPage)}
                >
                    {actualMaxPages}
                </Pagination.Item>
            );
        }

        return buttons;
    };

    return (
        <div className={className}>
            <div className={`text-muted small text-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
                {totalItems > 0 && (
                    <>
                        {isMobile ? (
                            <>Page {currentPage} of {actualMaxPages}</>
                        ) : (
                            <>
                                Showing {Math.min(totalItems, currentPage * itemsPerPage) - Math.min(totalItems, (currentPage - 1) * itemsPerPage)} of {totalItems} items
                                {totalPages > 0 && ` (Page ${currentPage} of ${actualMaxPages})`}
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="w-100 overflow-auto">
                <Pagination size={getPaginationSize()} className={`justify-content-center flex-wrap ${isMobile ? 'pagination-sm' : ''}`} style={{ gap: isMobile ? "1px" : undefined }}>
                    <Pagination.First
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="border border-dark d-none d-md-block"
                    />
                    <Pagination.Prev
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`border border-dark ${isMobile ? "custom-mobile-pagination" : ""}`}
                        style={isMobile ? paginationItemStyle(false) : {}}
                    >
                        {isMobile ? "‹" : "‹ Prev"}
                    </Pagination.Prev>

                    {renderPaginationItems()}

                    <Pagination.Next
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === actualMaxPages}
                        className={`border border-dark ${isMobile ? "custom-mobile-pagination" : ""}`}
                        style={isMobile ? paginationItemStyle(false) : {}}
                    >
                        {isMobile ? "›" : "Next ›"}
                    </Pagination.Next>
                    <Pagination.Last
                        onClick={() => onPageChange(actualMaxPages)}
                        disabled={currentPage === actualMaxPages}
                        className="border border-dark d-none d-md-block"
                    />
                </Pagination>
            </div>
        </div>
    );
};

export default CustomPagination; 