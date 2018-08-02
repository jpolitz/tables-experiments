import js-file("table") as T
import global as G

restaurants = T.csv-loader("restaurants.tsv", { header-row: true }).load(
  [G.raw-array: "restaurant_name", "boro", "building", "street", "zipcode", "cuisine", "inspection_date", "action", "violation_code", "violation_description", "critical_flag", "score", "grade", "grade_date", "inspection_type"],
  [G.raw-array: {name: "zipcode", sanitizer: T.string-to-number}])

fun is-critical(row): row.get-value("critical_flag") == "Critical" end

T.mean(restaurants.filter(is-critical).get-column("zipcode"))

