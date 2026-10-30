
from lxml import etree

# Validate using DTD
with open("greenshare.dtd", "rb") as f:
    dtd = etree.DTD(f)

dtd_doc = etree.parse("greenshare.xml")

if dtd.validate(dtd_doc):
    print("DTD validation successful!")
else:
    print(dtd.error_log)

# Validate using XSD
xsd_doc = etree.parse("greenshare-xsd.xml")
xsd_schema = etree.XMLSchema(
    etree.parse("greenshare.xsd")
)

if xsd_schema.validate(xsd_doc):
    print("XSD validation successful!")
else:
    print(xsd_schema.error_log)
