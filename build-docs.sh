WORKDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $WORKDIR
/usr/local/bin/sassdoc $WORKDIR/src/main/scss -d $WORKDIR/src/main/site/css -c $WORKDIR/build-docs.json
