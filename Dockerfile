# 1단계: React 빌드
FROM node:18 AS frontend-build
WORKDIR /app
COPY src/main/frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# 2단계: Spring Boot 빌드
FROM gradle:8.5-jdk17 AS backend-build
WORKDIR /app
COPY . .
COPY --from=frontend-build /app/frontend/build ./src/main/resources/static
RUN ./gradlew clean build -x test

# 3단계: 실행용 이미지
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
