# branch should have the format <RELEASE|FEATURE|FIX>_<any-branch-name>
# tag should have the format <major>.<minor>.<fix>

usage() {
    echo "USAGE:"
    echo "./get_next_tag.sh BRANCH_NAME CURRENT_TAG"
    echo "BRANCH_NAME should have the format <RELEASE|FEATURE|FIX>_<any-branch-name>"
    echo "CURRENT_TAG should have the format <major>.<minor>.<fix>"
}


branch=$1 #"RELEASE_patate_douce"
tag=$2 #"154.423.7"

if [ $# -lt 2 ]
then
  usage;
  exit 1;
fi


#find position of "_" in the branch name
underscore_position=$(awk -v a=$branch -v b="_" "BEGIN{print index(a,b)}")


# Coud be refactored to find n value
major=$(awk 'match($0, /[0-9]+/) {
  print substr($0, RSTART, RLENGTH)
};' <<< $tag)

minor=$(awk 'match($0, /[0-9]+/) {
  remaining=substr($0, RLENGTH + 2)
}; match(remaining, /[0-9]+/) {
  print substr(remaining, RSTART, RLENGTH)
};' <<< $tag)

fix=$(awk 'match($0, /[0-9]+/) {
  remaining=substr($0, RLENGTH + 2)
}; match(remaining, /[0-9]+/) {
  remaining=substr(remaining, RLENGTH + 2)
}; match(remaining, /[0-9]+/) {
  print substr(remaining, RSTART, RLENGTH)
};' <<< $tag)

branch_type=$(awk -v a=$branch -v b=$underscore_position "BEGIN{print substr(a,0,b)}")

#echo "Version: major=$major minor=$minor fix=$fix"
#echo "Branch type=$branch_type"

if [ $branch_type = "RELEASE" ]
then
  let "major+=1"
  let "minor=0"
  let "fix=0"
elif [ $branch_type = "FEATURE" ]
then
  let "minor+=1"
  let "fix=0"
elif [ $branch_type = "FIX" ]
then
  let "fix+=1"
fi

result_version="$major.$minor.$fix"

echo "$result_version"
