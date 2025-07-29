package com.devji.account_book.expense.dto;

import com.devji.account_book.expense.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long id;

    @NotNull(message = "거래 유형은 필수입니다")
    private TransactionType type;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotNull(message = "금액은 필수입니다")
    @DecimalMin(value = "0.01", message = "금액은 0보다 커야 합니다")
    private BigDecimal amount;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 255, message = "설명은 255자 이하여야 합니다")
    private String description;

    @NotNull(message = "거래 날짜는 필수입니다")
    private LocalDate transactionDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
