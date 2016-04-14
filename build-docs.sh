WORKDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $WORKDIR
sassdoc $WORKDIR/src/main/scss -d $WORKDIR/src/main/site/css