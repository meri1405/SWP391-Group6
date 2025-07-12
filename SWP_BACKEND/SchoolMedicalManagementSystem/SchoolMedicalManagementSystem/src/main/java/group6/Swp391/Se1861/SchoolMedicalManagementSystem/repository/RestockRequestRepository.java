package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestockRequestRepository extends JpaRepository<RestockRequest, Long> {
    
    List<RestockRequest> findByRequestedBy(Long requestedBy);
    
    List<RestockRequest> findByStatus(RestockRequest.RestockStatus status);
    
    List<RestockRequest> findByReviewedBy(Long reviewedBy);
    
    @Query("SELECT r FROM RestockRequest r WHERE r.requestedBy = :userId ORDER BY r.requestDate DESC")
    List<RestockRequest> findByRequestedByOrderByRequestDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT r FROM RestockRequest r WHERE r.status = :status ORDER BY r.requestDate ASC")
    List<RestockRequest> findByStatusOrderByRequestDateAsc(@Param("status") RestockRequest.RestockStatus status);
    
    @Query("SELECT r FROM RestockRequest r LEFT JOIN FETCH r.restockItems ri LEFT JOIN FETCH ri.medicalSupply WHERE r.status = :status ORDER BY r.requestDate ASC")
    List<RestockRequest> findByStatusWithItemsOrderByRequestDateAsc(@Param("status") RestockRequest.RestockStatus status);
    
    @Query("SELECT r FROM RestockRequest r LEFT JOIN FETCH r.restockItems ri LEFT JOIN FETCH ri.medicalSupply ORDER BY r.requestDate DESC")
    List<RestockRequest> findAllWithItems();
    
    @Query("SELECT r FROM RestockRequest r WHERE r.priority = :priority AND r.status = :status")
    List<RestockRequest> findByPriorityAndStatus(@Param("priority") String priority, @Param("status") RestockRequest.RestockStatus status);
    
    @Query("SELECT COUNT(r) FROM RestockRequest r WHERE r.status = :status")
    long countByStatus(@Param("status") RestockRequest.RestockStatus status);

    // Dashboard statistics methods
    long countByRequestDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByStatusAndRequestDateBetween(RestockRequest.RestockStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
