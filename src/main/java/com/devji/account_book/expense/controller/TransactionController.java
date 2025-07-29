package com.devji.account_book.expense.controller;

import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.expense.dto.TransactionDto;
import com.devji.account_book.expense.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Validated
@Slf4j
public class TransactionController {
    
    private final TransactionService transactionService;
    
    // 거래 생성
    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@AuthenticationPrincipal PrincipalDetails principalDetails, @Valid @RequestBody TransactionDto transactionDto) {
        log.info("Creating new transaction: {}", transactionDto);
        TransactionDto created = transactionService.createTransaction(principalDetails.getUser().getId(), transactionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // 거래 수정
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto transactionDto) {
        log.info("Updating transaction {}: {}", id, transactionDto);
        TransactionDto updated = transactionService.updateTransaction(principalDetails.getUser().getId(), id, transactionDto);
        return ResponseEntity.ok(updated);
    }
//
//    // 거래 삭제
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
//        log.info("Deleting transaction: {}", id);
//        transactionService.deleteTransaction(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    // 거래 단일 조회
//    @GetMapping("/{id}")
//    public ResponseEntity<TransactionDto> getTransaction(@PathVariable Long id) {
//        TransactionDto transaction = transactionService.getTransaction(id);
//        return ResponseEntity.ok(transaction);
//    }
//
    // 거래 목록 조회 (페이징)
    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getTransactions(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) int size) {
        Page<TransactionDto> transactions = transactionService.getTransactions(principalDetails.getUser().getId(), page, size);
        return ResponseEntity.ok(transactions);
    }
//
//    // 거래 검색
//    @GetMapping("/search")
//    public ResponseEntity<Page<TransactionDto>> searchTransactions(
//            @RequestParam String keyword,
//            @RequestParam(defaultValue = "0") @Min(0) int page,
//            @RequestParam(defaultValue = "20") @Min(1) int size) {
//        Page<TransactionDto> transactions = transactionService.searchTransactions(keyword, page, size);
//        return ResponseEntity.ok(transactions);
//    }
//
//    // 기간별 거래 조회
//    @GetMapping("/date-range")
//    public ResponseEntity<Page<TransactionDto>> getTransactionsByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
//            @RequestParam(defaultValue = "0") @Min(0) int page,
//            @RequestParam(defaultValue = "20") @Min(1) int size) {
//        Page<TransactionDto> transactions = transactionService.getTransactionsByDateRange(startDate, endDate, page, size);
//        return ResponseEntity.ok(transactions);
//    }
//
//    // 월별 통계
//    @GetMapping("/stats/{year}/{month}")
//    public ResponseEntity<Map<String, Object>> getMonthlyStats(
//            @PathVariable int year,
//            @PathVariable int month) {
//        Map<String, Object> stats = transactionService.getMonthlyStats(year, month);
//        return ResponseEntity.ok(stats);
//    }
}
