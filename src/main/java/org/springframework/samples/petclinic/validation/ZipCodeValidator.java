package org.springframework.samples.petclinic.validation;

import co.elastic.apm.api.CaptureSpan;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ZipCodeValidator implements ConstraintValidator<ZipCodeConstraint,String> {

    private Pattern zipPattern;
    @Override
    public void initialize(ZipCodeConstraint constraintAnnotation) {
        //a terrible zip code pattern, be gentle!
        this.zipPattern = Pattern.compile("^([\\d]+){5}(?:-([\\d]+){4})?$");
    }

    @CaptureSpan(value = "validateZipCode")
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        Matcher matcher = zipPattern.matcher(value);
        return matcher.find();
    }
}
