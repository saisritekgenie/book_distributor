FROM maven:3.8.5-openjdk-17

WORKDIR /app

# Copy all the project files into the container
COPY . .

# Expose the port
EXPOSE 8081

# Run the backend using Maven's spring-boot:run
CMD ["mvn", "spring-boot:run"]
