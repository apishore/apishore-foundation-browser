WORKDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $WORKDIR
node-sass -w -o $WORKDIR/css $WORKDIR/scss