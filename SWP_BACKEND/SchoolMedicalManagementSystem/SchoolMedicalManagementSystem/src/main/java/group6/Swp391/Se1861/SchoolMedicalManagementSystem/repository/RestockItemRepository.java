package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestockItemRepository extends JpaRepository<RestockItem, Long> {
    
    List<RestockItem> findByRestockRequestId(Long restockRequestId);
    
    List<RestockItem> findByMedicalSupplyId(Long medicalSupplyId);
    
    @Query("SELECT ri FROM RestockItem ri WHERE ri.restockRequest.id = :requestId")
    List<RestockItem> findItemsByRequestId(@Param("requestId") Long requestId);
    
    @Query("SELECT ri FROM RestockItem ri WHERE ri.medicalSupply.id = :supplyId")
    List<RestockItem> findItemsBySupplyId(@Param("supplyId") Long supplyId);
}
