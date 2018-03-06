#!/usr/bin/python
# -*- coding: utf-8 -*-
import googlemaps
import pdfminer.settings
import pdfminer.high_level
import pdfminer.layout
import re
import csv

'''
*    Python sciprt to pull info from Pipeline PDF
*    Extracts Project name and Addresses to CSV file
'''

pdfminer.settings.STRICT = False
client = googlemaps.Client('AIzaSyDLfUzhbXnWQoEz50JF0aWhrMJtdCYcY90')
project_statuses = ['UNDER REVIEW', 'UNDER CONSTRUCTION', 'APPROVED']
project_types = ['COMMERCIAL', 'RESIDENTIAL', 'COMMUNITY FACILITIES']

won_regex = re.compile("Y\d\d-\d\d\d")  # won := work order number
acre_regex = re.compile("\d.\d")
parcel_regex = re.compile("\d\d\d-\d\d\d-\d\d\d")
phone_regex = re.compile(".*?(\(?\d{3}\D{0,3}\d{3}\D{0,3}\d{4}).*?")


# PDF to plaintext

def extract_text(fname, outfile):
    laparams = pdfminer.layout.LAParams()
    for param in (
        'all_texts',
        'detect_vertical',
        'word_margin',
        'char_margin',
        'line_margin',
        'boxes_flow',
        ):
        paramv = locals().get(param, None)
        if paramv is not None:
            setattr(laparams, param, paramv)
    outfp = open(outfile, 'wt', encoding='utf-8')
    pdfminer.high_level.extract_text_to_fp(open(fname, 'rb'),
            **locals())
    outfp.close()
    return outfp


def read(path):
    f = open(path, 'r')
    s = f.read()
    f.close
    return s


def is_blank(line):
    return line.strip() == ''


def is_name(line):
    valid = won_regex.match(line)
    valid = valid or acre_regex.match(line)
    valid = valid or parcel_regex.match(line)
    valid = valid or line.isupper()
    valid = valid or is_blank(line)
    return valid


def parse_project(line, line_iter):
    name = line.rstrip()
    while True:
        try:
            line = next(line_iter).rstrip()
            if is_blank(line):
                return []
            geoson = client.geocode(line + ', Walnut Creek')
            if line[0].isdigit() and geoson \
                and not phone_regex.match(line):
                lat = geoson[0]['geometry']['location']['lat']
                lng = geoson[0]['geometry']['location']['lng']
                print(name + '\n' + line + '\n')
                return [name, line + ', Walnut Creek', lat, lng]
            else:
                name += ' ' + line
        except StopIteration:
            break


def get_status(project):
    status = project[4]
    if status == 'UNDER REVIEW':
        return 'under_review'
    if status == 'UNDER CONSTRUCTION':
        return 'under_construction'
    if status == 'APPROVED':
        return 'approved'
    return ''


extract_text("ProjectPipeline.pdf", "ProjectPipeline.txt")

line_iter = iter(read('ProjectPipeline.txt').splitlines())
curr_status = project_statuses[0]
curr_type = project_types[0]
projects = []

prev_blank = 0
while True:
    try:
        line = next(line_iter)
        for p_status in project_statuses:
            if p_status in line:
                for p_type in project_types:
                    if p_type in line:
                        (curr_status, curr_type) = (p_status, p_type)
                        break
                print(curr_status, '-', curr_type)
                line = next(line_iter)
                break
        if prev_blank == 2 and not is_name(line):
            parsed = parse_project(line, line_iter)
            if parsed:
                parsed.append(curr_status)
                parsed.append(curr_type)
                projects.append(parsed)
        if is_blank(line):
            prev_blank += 1
        else:
            prev_blank = 0
    except StopIteration:
        break

with open('projects.csv', 'wt') as f:
    writer = csv.writer(f, lineterminator='\n')
    writer.writerows(projects)
