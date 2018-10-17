#!/bin/bash
#From https://github.com/justb4/docker-jmeter/blob/master/entrypoint.sh
set -e
freeMem=`awk '/MemFree/ { print int($2/1024) }' /proc/meminfo`
s=$(($freeMem/10*8))
x=$(($freeMem/10*8))
n=$(($freeMem/10*2))
export JVM_ARGS="-Xmn${n}m -Xms${s}m -Xmx${x}m"

echo "START Running Jmeter on `date`"
echo "JVM_ARGS=${JVM_ARGS}"
echo "jmeter args=$@"

jmeter -Dlog_level.jmeter=DEBUG -JENDPOINT_BASE=${ENDPOINT_BASE:-localhost} -JENDPOINT_PORT=${ENDPOINT_PORT:-8000} -JENDPOINT_PROTOCOL=${ENDPOINT_PROTOCOL:-http} -n -t ${JMETER_HOME}/jmeter-petclinic-server.jmx -j /dev/stdout
echo "END Running Jmeter on `date`"
