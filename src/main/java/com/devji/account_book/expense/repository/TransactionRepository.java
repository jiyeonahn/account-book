package com.devji.account_book.expense.repository;

import com.devji.account_book.expense.entity.Transaction;
import com.devji.account_book.expense.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
//    // 사용자별 거래 내역 조회
//    Page<Transaction> findByUserIdOrderByTransactionDateDescCreatedAtDesc(String userId, Pageable pageable);
//
//    // 사용자별 특정 거래 조회
//    Optional<Transaction> findByIdAndUserId(Long id, String userId);
//
//    // 사용자별 거래 내역 검색
//    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND " +
//           "(LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//           "LOWER(t.category) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
//           "ORDER BY t.transactionDate DESC, t.createdAt DESC")
//    Page<Transaction> findByUserIdAndSearch(@Param("userId") String userId,
//                                          @Param("keyword") String keyword,
//                                          Pageable pageable);
//
//    // 사용자별 기간별 거래 조회
//    Page<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
//            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable);
//
//    // 사용자별 카테고리별 거래 조회
//    Page<Transaction> findByUserIdAndCategoryOrderByTransactionDateDescCreatedAtDesc(
//            String userId, String category, Pageable pageable);
//
//    // 사용자별 유형별 거래 조회
//    Page<Transaction> findByUserIdAndTypeOrderByTransactionDateDescCreatedAtDesc(
//            String userId, TransactionType type, Pageable pageable);
//
//    // 월별 통계 - 총 수입
//    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.type = 'INCOME' " +
//           "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
//    BigDecimal getTotalIncomeByMonth(@Param("userId") String userId,
//                                   @Param("year") int year,
//                                   @Param("month") int month);
//
//    // 월별 통계 - 총 지출
//    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.type = 'EXPENSE' " +
//           "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
//    BigDecimal getTotalExpenseByMonth(@Param("userId") String userId,
//                                    @Param("year") int year,
//                                    @Param("month") int month);
//
//    // 카테고리별 통계
//    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t " +
//           "WHERE t.userId = :userId AND t.type = :type " +
//           "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month " +
//           "GROUP BY t.category")
//    List<Object[]> getCategoryStatsByMonth(@Param("userId") String userId,
//                                         @Param("type") TransactionType type,
//                                         @Param("year") int year,
//                                         @Param("month") int month);
}
