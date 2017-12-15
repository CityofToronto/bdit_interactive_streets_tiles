-- Schema: ryu4

-- DROP SCHEMA ryu4;
DROP TABLE streets_tiled_offset; 

CREATE TABLE streets_tiled_offset AS 
  SELECT feature_code_desc, 
         sc.centreline_id, 
         sc.linear_name_full,
         sc.linear_name_id,
         aadt.volume,
         aadt.year,
         St_offsetcurve(St_linemerge(St_transform(sc.shape, 3857)), CASE
									WHEN aadt.volume IS NULL THEN -8
									WHEN aadt.volume BETWEEN 0 AND 2500 THEN -10
									WHEN aadt.volume BETWEEN 2500 AND 5000 THEN -12
									WHEN aadt.volume BETWEEN 5000 AND 10000 THEN -14
									WHEN aadt.volume BETWEEN 10000 AND 25000 THEN -16
									WHEN aadt.volume BETWEEN 25000 AND 50000 THEN -18
									WHEN aadt.volume BETWEEN 50000 AND 75000 THEN -20
									WHEN aadt.volume > 75000 THEN -22
									END, 'quad_segs=4 join=round') geom,
	 direction_from_line(St_transform(sc.shape, 3857)) AS direction,
         sc.oneway_dir_code,
         1 AS dir_bin,
         streets_zoomlevels.min_zoom
  FROM   prj_volume.centreline sc 
         INNER JOIN gis.streets_zoomlevels ON fcode_desc = sc.feature_code_desc
         FULL OUTER JOIN prj_volume.centreline_aadt_group12 aadt ON aadt.centreline_id = sc.centreline_id AND aadt.dir_bin = 1
  WHERE sc.oneway_dir_code = 0 OR sc.oneway_dir_code = 1
  GROUP BY sc.feature_code_desc, 
            sc.centreline_id,
            sc.linear_name_full,
            sc.linear_name_id,
            aadt.volume,
            aadt.year,
            geom,
            sc.oneway_dir_code_desc, 
            streets_zoomlevels.min_zoom
  UNION ALL 
  SELECT feature_code_desc, 
         sc.centreline_id, 
         sc.linear_name_full,
         sc.linear_name_id,
         aadt.volume,
         aadt.year,
         ST_Reverse(St_offsetcurve(St_linemerge(St_transform(sc.shape, 3857)), CASE
									WHEN aadt.volume IS NULL THEN 8
									WHEN aadt.volume BETWEEN 0 AND 2500 THEN 10
									WHEN aadt.volume BETWEEN 2500 AND 5000 THEN 12
									WHEN aadt.volume BETWEEN 5000 AND 10000 THEN 14
									WHEN aadt.volume BETWEEN 10000 AND 25000 THEN 16
									WHEN aadt.volume BETWEEN 25000 AND 50000 THEN 18
									WHEN aadt.volume BETWEEN 50000 AND 75000 THEN 20
									WHEN aadt.volume > 75000 THEN 22
									END, 'quad_segs=4 join=round')) geom,
	 direction_from_line(ST_Reverse(St_transform(sc.shape, 3857))) AS direction,
         sc.oneway_dir_code,
         -1 AS dir_bin,
         streets_zoomlevels.min_zoom 
  FROM   prj_volume.centreline sc 
         INNER JOIN gis.streets_zoomlevels ON fcode_desc = sc.feature_code_desc
         FULL OUTER JOIN prj_volume.centreline_aadt_group12 aadt ON aadt.centreline_id = sc.centreline_id AND aadt.dir_bin = -1
  WHERE sc.oneway_dir_code = 0 OR sc.oneway_dir_code = -1
  GROUP  BY sc.feature_code_desc, 
            sc.centreline_id, 
            sc.linear_name_full,
            sc.linear_name_id,
            aadt.volume,
            aadt.year,
            geom,
            sc.oneway_dir_code_desc, 
            streets_zoomlevels.min_zoom
  