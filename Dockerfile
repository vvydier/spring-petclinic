#Multi-Stage build

#Build application stage
#We need maven.
FROM maven:3.5.3-jdk-10
ARG JAVA_AGENT_BRANCH=0.7
ARG JAVA_AGENT_REPO=elastic/apm-agent-java

WORKDIR /usr/src/java-app

#build the application
ADD . /usr/src/java-code/spring-petclinic
WORKDIR /usr/src/java-code/spring-petclinic

RUN mvn -q -B package -DskipTests

RUN cp -v /usr/src/java-code/spring-petclinic/target/*.jar /usr/src/java-app/app.jar

#build the agent
WORKDIR /usr/src/java-agent-code
RUN curl -L https://github.com/$JAVA_AGENT_REPO/archive/$JAVA_AGENT_BRANCH.tar.gz | tar --strip-components=1 -xz

RUN mvn -q -B package -DskipTests


RUN export JAVA_AGENT_BUILT_VERSION=$(mvn -q -Dexec.executable="echo" -Dexec.args='${project.version}' --non-recursive org.codehaus.mojo:exec-maven-plugin:1.3.1:exec) \
    && cp -v /usr/src/java-agent-code/elastic-apm-agent/target/elastic-apm-agent-${JAVA_AGENT_BUILT_VERSION}.jar /usr/src/java-app/elastic-apm-agent.jar


FROM openjdk:10

RUN export
WORKDIR /app

COPY --from=0 /usr/src/java-app/*.jar ./

CMD java -javaagent:/app/elastic-apm-agent.jar\
                                        -Dspring.profiles.active=${JAVA_PROFILE:-hsqldb,spring-data-jpa}\
                                        -Dserver.port=${SERVER_PORT:-}\
                                        -Dserver.context-path=/petclinic/\
                                        -Dspring.messages.basename=messages/messages\
                                        -Dlogging.level.org.springframework=${LOG_LEVEL:-INFO}\
                                        -Dsecurity.ignored=${SECURITY_IGNORED:-/**}\
                                        -Dbasic.authentication.enabled=${AUTHENTICATION_ENABLED:-false}\
                                        -Dserver.address=${SERVER_ADDRESS:-0.0.0.0}\
                                        -Dspring.datasource.url=${DATABASE_URL:-jdbc:hsqldb:mem:petclinic}\
                                        -Dspring.datasource.username=${DATABASE_USERNAME:-sa}\
                                        -Dspring.datasource.password=${DATABASE_PASSWORD:-}\
                                        -Dspring.datasource.driver-class-name=${DATABASE_DRIVER:-}\
                                        -Dspring.jpa.database=${DATABASE_DIALECT:-HSQL}\
                                        -Dspring.jpa.database-platform=${DATABASE_PLATFORM:-org.hibernate.dialect.HSQLDialect}\
                                        -Dspring.jpa.hibernate.ddl-auto=${DDL_AUTO:-none}\
                                        -Dspring.datasource.schema=${DATASOURCE_SCHEMA:-classpath*:db/hsqldb/initDB.sql}\
                                        -Dspring.datasource.data=${DATASOURCE_DATA:-classpath*:db/hsqldb/populateDB.sql}\
                                        -Delastic.apm.service_name=${ELASTIC_APM_SERVICE_NAME:-spring-petclinic}\
                                        -Delastic.apm.environment=production\
                                        -Delastic.apm.transaction_sample_rate=${APM_SAMPLE_RATE:-1.0}\
                                        -Delastic.apm.capture_body=all\
                                        -Delastic.apm.server_urls=${ELASTIC_APM_SERVER_URL:-http://localhost:8200}\
                                        -Delastic.apm.verify_server_cert=false\
                                        -Delastic.apm.ignore_urls=/health,/metrics*,/jolokia\
                                        -Delastic.apm.log_file=/var/log/apps/apm-spring-petclinic\
                                        -Delastic.apm.enable_log_correlation=true\
                                        -jar /app/app.jar
